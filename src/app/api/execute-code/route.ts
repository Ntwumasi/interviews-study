import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'

// Map our language names to Piston API language names
const LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
}

// Maximum code size (50KB)
const MAX_CODE_SIZE = 50 * 1024

// Execution timeout (30 seconds)
const EXECUTION_TIMEOUT_MS = 30000

// Maximum output size (100KB)
const MAX_OUTPUT_SIZE = 100 * 1024

/**
 * POST /api/execute-code
 * Executes code using Piston API
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`execute-code:${userId}`, RATE_LIMITS.executeCode)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many code executions. Please wait before running more code.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      )
    }

    const { code, language } = await request.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Missing code or language' },
        { status: 400 }
      )
    }

    // Validate code size
    if (code.length > MAX_CODE_SIZE) {
      return NextResponse.json(
        { error: `Code is too large. Maximum size is ${MAX_CODE_SIZE / 1024}KB.` },
        { status: 400 }
      )
    }

    const pistonLanguage = LANGUAGE_MAP[language]
    if (!pistonLanguage) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      )
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS)

    try {
      // Call Piston API to execute code with timeout
      const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: pistonLanguage,
          version: '*', // Use latest version
          files: [
            {
              name: `main.${getFileExtension(language)}`,
              content: code,
            },
          ],
          // Piston API run limits
          run_timeout: 10000, // 10 second execution limit
          compile_timeout: 10000, // 10 second compile limit
          compile_memory_limit: 256000000, // 256MB compile memory
          run_memory_limit: 256000000, // 256MB run memory
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!pistonResponse.ok) {
        console.error('[Execute] Piston API error:', await pistonResponse.text())
        return NextResponse.json(
          { error: 'Code execution service unavailable' },
          { status: 503 }
        )
      }

      const result = await pistonResponse.json()

      // Combine stdout and stderr
      let output = ''
      if (result.run?.stdout) {
        output += result.run.stdout
      }
      if (result.run?.stderr) {
        output += result.run.stderr
      }
      if (result.run?.output) {
        output = result.run.output
      }

      // If compilation failed
      if (result.compile?.stderr) {
        output = 'Compilation Error:\n' + result.compile.stderr
      }

      // Truncate output if too large
      if (output.length > MAX_OUTPUT_SIZE) {
        output = output.substring(0, MAX_OUTPUT_SIZE) + '\n\n... Output truncated (exceeded 100KB limit)'
      }

      return NextResponse.json({
        output: output || 'No output',
        language: result.language,
        version: result.version,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Code execution timed out. Please check for infinite loops or reduce complexity.' },
          { status: 408 }
        )
      }
      throw fetchError
    }
  } catch (error) {
    console.error('[Execute] Error executing code:', error)
    return NextResponse.json(
      { error: 'Failed to execute code' },
      { status: 500 }
    )
  }
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    go: 'go',
  }
  return extensions[language] || 'txt'
}
