import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CompanyTracks } from '@/components/dashboard/company-tracks'

describe('CompanyTracks', () => {
  it('renders the section header', () => {
    render(<CompanyTracks />)
    expect(screen.getByText('Company Interview Tracks')).toBeInTheDocument()
    expect(screen.getByText('Prepare for specific company interviews')).toBeInTheDocument()
  })

  it('renders all company cards', () => {
    render(<CompanyTracks />)
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('Meta')).toBeInTheDocument()
    expect(screen.getByText('Amazon')).toBeInTheDocument()
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Microsoft')).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('shows premium badge for premium tracks', () => {
    render(<CompanyTracks />)
    // Apple and Netflix are premium
    const proBadges = screen.getAllByText('PRO')
    expect(proBadges.length).toBe(2)
  })

  it('expands track on click to show interview types', () => {
    render(<CompanyTracks />)

    // Click on Google track
    const googleCard = screen.getByText('Google').closest('div[class*="cursor-pointer"]')
    expect(googleCard).toBeInTheDocument()
    fireEvent.click(googleCard!)

    // Should now show interview types
    expect(screen.getByText('coding')).toBeInTheDocument()
    expect(screen.getByText('system design')).toBeInTheDocument()
    expect(screen.getByText('behavioral')).toBeInTheDocument()
  })

  it('collapses track when clicked again', () => {
    render(<CompanyTracks />)

    // Click to expand
    const googleCard = screen.getByText('Google').closest('div[class*="cursor-pointer"]')
    fireEvent.click(googleCard!)

    // Click to collapse
    fireEvent.click(googleCard!)

    // Should show the hint to expand again
    const hints = screen.getAllByText('Click to see interview types')
    expect(hints.length).toBeGreaterThan(0)
  })

  it('displays difficulty badges correctly', () => {
    render(<CompanyTracks />)

    // Google is hard, Microsoft is medium
    const hardBadges = screen.getAllByText('hard')
    const mediumBadges = screen.getAllByText('medium')

    expect(hardBadges.length).toBeGreaterThan(0)
    expect(mediumBadges.length).toBeGreaterThan(0)
  })

  it('shows question counts for each company', () => {
    render(<CompanyTracks />)
    // Just check that question counts are displayed
    const questionLabels = screen.getAllByText(/\d+ questions/)
    expect(questionLabels.length).toBeGreaterThan(0)
  })

  it('shows progress when completedInterviews is provided', () => {
    render(<CompanyTracks completedInterviews={{ google: 5 }} />)
    expect(screen.getByText('5/15')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })

  it('disables premium track buttons', () => {
    render(<CompanyTracks />)

    // Click on Apple (premium) track
    const appleCard = screen.getByText('Apple').closest('div[class*="cursor-pointer"]')
    fireEvent.click(appleCard!)

    // Find the buttons - they should be disabled
    const buttons = screen.getAllByRole('button').filter(btn =>
      btn.classList.contains('cursor-not-allowed') || btn.hasAttribute('disabled')
    )
    expect(buttons.length).toBeGreaterThan(0)
  })
})
