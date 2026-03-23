# EduAlly Homepage - Design & Implementation Guide

## Overview

The homepage is a "Living Page" that demonstrates AI and accessibility features before users even log in. It uses modern design principles including glassmorphism, smooth animations, and interactive demos.

## Component Structure

```
src/components/Homepage/
├── Navigation.tsx              # Fixed navbar with accessibility toggle
├── AccessibilityDropdown.tsx   # Pre-login accessibility options
├── HeroSection.tsx             # Main hero with AI demo
├── PathCards.tsx               # Role-based routing cards
├── AgentShowcase.tsx           # Interactive agent features
├── PricingSection.tsx          # Departmental licensing tiers
├── TrustSection.tsx            # Trust banner
└── Footer.tsx                  # Footer with developer credit
```

## Key Features

### 1. Navigation Bar
- **Fixed positioning** at top with glassmorphism effect
- **Logo** with gradient background
- **Center navigation links** (Home, Features, For Faculties, Contact)
- **Accessibility icon** (♿) that opens dropdown before login
- **Login/Sign Up buttons** with gradient styling
- **Focus states** for keyboard navigation

### 2. Accessibility Dropdown
- **Pre-login accessibility options**:
  - Dyslexia-friendly font toggle
  - High contrast mode toggle
- **Persistent across page** - changes apply immediately
- **Smooth transitions** for all toggles

### 3. Hero Section
- **Soft gradient background** (blue → purple → pink)
- **Large, bold headline** with gradient text
- **Interactive AI demo box**:
  - "Try the Reader Agent" with play button
  - Text-to-speech functionality
  - Shows AI capability immediately
- **Two CTA buttons**:
  - Primary: "Enter Learning Hub"
  - Secondary: "Explore Features"
- **Responsive layout** (stacked on mobile, side-by-side on desktop)

### 4. Path Cards
- **Three role-based cards**:
  - For Students (👨‍🎓)
  - For Lecturers (👨‍🏫)
  - For Administrators (⚙️)
- **Glassmorphism design** with hover effects
- **Middle card scales up** on desktop for emphasis
- **Smooth hover animations** (translate-y, shadow)
- **Links to respective dashboards**

### 5. Agent Showcase
- **Tabbed interface** for three agents:
  - Content Agent (📄)
  - Accessibility Agent (♿)
  - Assessment Agent (✅)
- **Interactive tab switching** with smooth animations
- **Visual representation** of each agent's function
- **Feature list** for each agent
- **Glassmorphism cards** with backdrop blur

### 6. Pricing Section
- **Two-tier pricing model**:
  - Basic Tier: Free (individual students)
  - Faculty Premium: ₦53,750/semester (departments)
- **Highlighted "Most Popular" tier** with scale effect
- **Feature comparison** between tiers
- **Pricing note** explaining 7.5% system charges
- **CTA buttons** for each tier

### 7. Trust Section
- **Nigerian context** emphasis
- **Gradient background** with white text
- **Institutional credibility** messaging

### 8. Footer
- **Four-column layout** (Brand, Product, Company, Legal)
- **Developer credit** prominently displayed:
  - System Architect: Amiola Oluwademilade Emmanuel
  - Matric: 220194031
  - Lagos State University
- **Copyright and year** auto-updated
- **All links keyboard accessible**

## Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Secondary**: Purple (#9333ea)
- **Accent**: Pink (#ec4899)
- **Neutral**: Slate (various shades)
- **Success**: Green (#22c55e)

### Typography
- **Font**: Lexend (dyslexia-friendly)
- **Sizes**: 
  - Hero headline: 5xl-6xl
  - Section titles: 4xl-5xl
  - Body: base-lg
  - Small: sm-xs

### Spacing
- **Sections**: py-20 (80px)
- **Container**: max-w-7xl with px-8
- **Gap between elements**: gap-8 to gap-12

### Effects
- **Glassmorphism**: `bg-white/40 backdrop-blur-xl border border-white/60`
- **Gradients**: `from-blue-500 to-purple-600`
- **Shadows**: `shadow-lg hover:shadow-xl`
- **Animations**: Smooth transitions on all interactive elements

## Accessibility Features

### Keyboard Navigation
- All buttons and links have focus states
- Focus ring: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- Tab order follows visual hierarchy

### Pre-Login Accessibility
- Dyslexia font toggle (OpenDyslexic)
- High contrast mode (black background, yellow text)
- Changes apply immediately to entire page

### ARIA & Semantic HTML
- Proper heading hierarchy (h1, h2, h3)
- Semantic buttons and links
- Form labels properly associated
- Alt text for icons (via title attributes)

### High Contrast Mode
- Defined in `globals.css` with `html.high-contrast` selector
- Yellow text on black background
- Bold font weights for emphasis
- High contrast focus states

## Responsive Design

### Breakpoints
- **Mobile**: Default (< 768px)
- **Tablet**: md: (768px+)
- **Desktop**: lg: (1024px+)

### Responsive Patterns
- **Navigation**: Hidden center links on mobile, visible on md+
- **Hero**: Stacked on mobile, side-by-side on lg+
- **Path Cards**: Single column on mobile, 3 columns on lg+
- **Agent Showcase**: Stacked on mobile, side-by-side on lg+
- **Pricing**: Single column on mobile, 2 columns on md+
- **Footer**: Single column on mobile, 4 columns on md+

## Interactive Elements

### Hover Effects
- Cards: `hover:-translate-y-2 hover:shadow-xl`
- Buttons: `hover:shadow-lg`
- Links: `hover:text-blue-600`
- Icons: `group-hover:scale-110`

### Animations
- Fade-in for agent showcase: `animate-fadeIn`
- Smooth transitions: `transition-all`
- Transform effects: `hover:-translate-y-1`

### Interactive Demo
- Text-to-speech button with play/pause states
- Visual feedback (color change when active)
- Accessible via keyboard

## Performance Considerations

- **Lazy loading**: Images and heavy components
- **CSS-in-JS**: Minimal, only for animations
- **Optimized images**: SVG icons where possible
- **No external dependencies**: Pure React + Tailwind

## SEO Optimization

- **Meta tags**: Title, description, keywords, author
- **Semantic HTML**: Proper heading structure
- **Open Graph**: Ready for social sharing
- **Structured data**: Ready for schema markup

## Future Enhancements

1. **Testimonials section** with student/lecturer quotes
2. **Live statistics** (students served, courses created, etc.)
3. **Blog integration** for educational content
4. **Video demos** of key features
5. **Chatbot** for pre-login support
6. **Language switcher** for multilingual support
7. **Dark mode toggle** (separate from high contrast)
8. **Newsletter signup** section

## Development Notes

### Adding New Sections
1. Create component in `src/components/Homepage/`
2. Import in `src/app/page.tsx`
3. Add to main layout
4. Ensure responsive design
5. Test keyboard navigation

### Styling Guidelines
- Use Tailwind utilities exclusively
- Follow color palette
- Maintain consistent spacing
- Ensure focus states on all interactive elements
- Test in high contrast mode

### Testing Checklist
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader compatibility
- [ ] Mobile responsiveness
- [ ] High contrast mode
- [ ] Dyslexia font mode
- [ ] Text-to-speech functionality
- [ ] All links working
- [ ] Form validation
- [ ] Performance (Lighthouse)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest versions

## Deployment

1. Build: `npm run build`
2. Test: `npm run dev`
3. Deploy to Vercel or similar
4. Monitor performance with Lighthouse
5. Track accessibility with axe DevTools
