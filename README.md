# Finance Calculator

A comprehensive web application for financial calculations and investment planning. Calculate returns for various investment scenarios including SIP, lumpsum investments, CAGR, and inflation adjustments.

## Features

- **SIP Calculator** - Calculate returns on Systematic Investment Plans with step-up options
- **Lumpsum Calculator** - Calculate returns on one-time investments
- **CAGR Calculator** - Calculate Compound Annual Growth Rate
- **Inflation Calculator** - Adjust investment values for inflation
- **Multiplier Calculator** - Calculate time to reach investment multipliers or find multipliers between amounts
- **URL Parameter Support** - Share calculator states via shareable URLs
- **Dark/Light/System Theme** - Toggle between themes including system preference
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Calculations** - Instant results as you input values

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Language**: TypeScript
- **Linting**: Biome
- **Font**: Geist Sans & Geist Mono

## Installation

1. Clone the repository:

```bash
git clone https://github.com/zytact/finance.git
cd finance
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Calculators

### SIP Calculator (`/sip`)

Calculate potential returns from Systematic Investment Plans with customizable:

- Monthly/Weekly/Quarterly/Yearly/15-day investment frequency
- Investment duration
- Expected annual return rate
- Payment timing (beginning or end of period)
- Step-up SIP functionality (increasing investment amounts over time)

### Lumpsum Calculator (`/lumpsum`)

Calculate returns from one-time investments with:

- Principal investment amount
- Investment duration
- Expected annual return rate

### CAGR Calculator (`/cagr`)

Calculate Compound Annual Growth Rate for investments:

- Initial investment amount
- Final investment value
- Investment duration

### Inflation Calculator (`/inflation`)

Adjust investment values for inflation:

- Current investment amount
- Expected inflation rate
- Time period

### Multiplier Calculator (`/multiplier`)

Calculate investment multipliers and growth timelines:

- Calculate time to reach a specific multiplier
- Calculate multiplier between two amounts
- Support for URL parameters to share calculations

## Development

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter
- `pnpm format` - Format code with Biome

### Code Quality

This project uses:

- **Biome** for linting and formatting
- **TypeScript** with strict mode enabled
- **ESLint** rules for React and Next.js best practices

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and run tests
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
