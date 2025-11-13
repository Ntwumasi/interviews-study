import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Map our language names to Piston API language names
const LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  go: 'go',
}

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

    const { code, language } = await request.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Missing code or language' },
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

    // Call Piston API to execute code
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
      }),
    })

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

    return NextResponse.json({
      output: output || 'No output',
      language: result.language,
      version: result.version,
    })
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
