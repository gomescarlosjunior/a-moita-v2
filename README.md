# A Moita - Green Energy Solutions

A modern, responsive website built with Next.js 13+ featuring green energy solutions. This project showcases renewable energy services with a beautiful, interactive user interface.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom design system
- **Framer Motion** for smooth animations
- **Swiper** for interactive carousels
- **Turbopack** for fast development builds
- **Prettier** with Tailwind CSS plugin for code formatting
- **ESLint** for code quality
- **pnpm** as package manager
- **Vercel** for deployment

## Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd a-moita-v2
   ```

2. **Install dependencies using pnpm**
   ```bash
   pnpm install
   ```

3. **Start the development server with Turbopack**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Design System

The project includes a comprehensive design system with:

- **Custom Colors**: Teal, lime, gray, and other brand colors
- **Typography**: Figtree font family with multiple weights
- **Spacing**: Extended spacing scale for precise layouts
- **Animations**: Custom animations including slow spin and star spin
- **Responsive Breakpoints**: xs (480px), sm (640px), md (768px), lg (1024px), xl (1216px)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Homepage component
│   └── globals.css        # Global styles with Tailwind
├── components/            # Reusable React components
├── lib/                   # Utility functions
├── styles/               # Additional styles
└── types/                # TypeScript type definitions
```

## Features

- **Responsive Design**: Mobile-first approach with smooth breakpoints
- **Interactive Navigation**: Mobile menu with smooth animations
- **Hero Section**: Eye-catching header with Framer Motion animations
- **Solutions Showcase**: Grid layout highlighting green energy solutions
- **Testimonials Carousel**: Interactive testimonials with navigation
- **Performance Optimized**: Next.js Image optimization and lazy loading
- **SEO Ready**: Proper metadata and semantic HTML structure

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Configure build settings** (auto-detected from `vercel.json`)
3. **Deploy** - Vercel will automatically build and deploy your site

### Manual Deployment

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

## Configuration

### Environment Variables

Create a `.env.local` file for environment-specific variables:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Tailwind CSS

The project uses a custom Tailwind configuration (`tailwind.config.ts`) with:
- Extended color palette
- Custom spacing values
- Additional font families
- Custom animations

### TypeScript

TypeScript is configured with strict mode and path aliases:
- `@/*` maps to `./src/*`
- `@/components/*` maps to `./src/components/*`
- `@/lib/*` maps to `./src/lib/*`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact:
- Email: support@pixelrocket.store
- Website: [www.pixelrocket.store](https://www.pixelrocket.store)

---

Built with ❤️ using modern web technologies for a sustainable future.
