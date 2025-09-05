'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import components with no SSR
const FAQ = dynamic(() => import('@/app/components/FAQ'), { ssr: false })
const Commitment = dynamic(() => import('@/app/components/Commitment'), {
  ssr: false,
})

export default function HomePage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const solutions = [
    {
      title: 'Soluções Sustentáveis',
      description:
        'Desenvolvemos e implementamos soluções inovadoras que reduzem o impacto ambiental, mantendo alta eficiência e confiabilidade.',
      image: '/images/origem/origem-1.jpg',
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 8C0 3.58172 3.58172 0 8 0H40C44.4183 0 48 3.58172 48 8V40C48 44.4183 44.4183 48 40 48H8C3.58172 48 0 44.4183 0 40V8Z"
            fill="white"
          />
          <path
            d="M24 12L28 20H32L25 24L29 32L24 27L19 32L23 24L16 20H20L24 12Z"
            fill="#022C22"
          />
        </svg>
      ),
    },
    {
      title: 'Impacto na Comunidade',
      description:
        'Mais do que construir, cultivamos raízes: o pé de manga no coração da Moita simboliza nosso compromisso em gerar vida, compartilhar frutos e fortalecer a comunidade local.',
      image: '/images/origem/origem-2.jpg',
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 8C0 3.58172 3.58172 0 8 0H40C44.4183 0 48 3.58172 48 8V40C48 44.4183 44.4183 48 40 48H8C3.58172 48 0 44.4183 0 40V8Z"
            fill="white"
          />
          <path
            d="M32 32H16V28H32V32ZM36 24H12V20H36V24ZM40 16H8V12H40V16Z"
            fill="#022C22"
          />
        </svg>
      ),
    },
    {
      title: 'Inovação & Pesquisa',
      description:
        'Do ferro que sustenta nossas estruturas aos tijolos ecológicos que moldam os espaços, cada solução nasce da busca por equilíbrio entre inovação e sustentabilidade. Transformamos técnicas construtivas em ambientes que oferecem conforto, estética e eficiência energética.',
      image: '/images/origem/origem-3.jpg',
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 8C0 3.58172 3.58172 0 8 0H40C44.4183 0 48 3.58172 48 8V40C48 44.4183 44.4183 48 40 48H8C3.58172 48 0 44.4183 0 40V8Z"
            fill="white"
          />
          <path
            d="M24 12L30 22H18L24 12ZM24 28C27.3137 28 30 25.3137 30 22C30 18.6863 27.3137 16 24 16C20.6863 16 18 18.6863 18 22C18 25.3137 20.6863 28 24 28Z"
            fill="#022C22"
          />
        </svg>
      ),
    },
    {
      title: 'Responsabilidade Ambiental',
      description:
        'Entre o canto da seriema e o voo do tucano, reafirmamos nossa missão: proteger a biodiversidade do Cerrado e garantir que a Moita seja um espaço de convivência harmônica com a natureza.',
      image: '/images/origem/origem-4.jpg',
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 8C0 3.58172 3.58172 0 8 0H40C44.4183 0 48 3.58172 48 8V40C48 44.4183 44.4183 48 40 48H8C3.58172 48 0 44.4183 0 40V8Z"
            fill="white"
          />
          <path
            d="M24 12C15.1634 12 8 19.1634 8 28C8 36.8366 15.1634 44 24 44C32.8366 44 40 36.8366 40 28C40 19.1634 32.8366 12 24 12ZM24 40C17.3726 40 12 34.6274 12 28C12 21.3726 17.3726 16 24 16C30.6274 16 36 21.3726 36 28C36 34.6274 30.6274 40 24 40Z"
            fill="#022C22"
          />
        </svg>
      ),
    },
  ]

  return (
    <div>
      {/* Header Section */}
      <header className="relative bg-teal-800">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/assets/backgrounds/waves-header.png"
            alt="Ondas de fundo"
            fill
            className="object-cover opacity-10"
            priority
          />
        </div>
        <nav className="relative z-10 py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Link href="#" className="inline-block">
                <Image
                  src="/assets/branding/logo-white.svg"
                  alt="A Moita"
                  width={144}
                  height={48}
                  className="h-10 w-auto md:h-12"
                  priority
                />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden items-center space-x-6 md:flex lg:space-x-8">
                <a
                  href="#"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Início
                </a>
                <a
                  href="#nossos-pilares"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Sobre
                </a>
                <a
                  href="#chales"
                  className="text-base text-gray-100 transition-colors hover:text-gold-300 lg:text-lg"
                >
                  Chalés
                </a>
                <a
                  href="https://wa.me/5562991639312?text=Olá, temos dias disponíveis?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gold-300 px-4 py-2 text-sm font-medium text-teal-900 transition-colors hover:bg-gold-400 lg:px-6 lg:text-base"
                >
                  Reservar
                </a>
              </div>

              {/* Mobile menu button */}
              <button
                className="-mr-2 p-2 text-gray-100 md:hidden"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileNavOpen}
              >
                {mobileNavOpen ? (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`transition-all duration-300 ease-in-out md:hidden ${mobileNavOpen ? 'max-h-96 opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}
          >
            <div className="mt-4 space-y-2 rounded-lg bg-teal-800/95 px-4 pb-4 pt-2 shadow-lg backdrop-blur-sm">
              <a
                href="#"
                className="block rounded-md px-4 py-3 text-base font-medium text-gray-100 transition-colors hover:bg-teal-700/30"
                onClick={() => setMobileNavOpen(false)}
              >
                Início
              </a>
              <a
                href="#nossos-pilares"
                className="block rounded-md px-4 py-3 text-base font-medium text-gray-100 transition-colors hover:bg-teal-700/30"
                onClick={() => setMobileNavOpen(false)}
              >
                Sobre
              </a>
              <a
                href="#chales"
                className="block rounded-md px-4 py-3 text-base font-medium text-gray-100 transition-colors hover:bg-teal-700/30"
                onClick={() => setMobileNavOpen(false)}
              >
                Chalés
              </a>
              <a
                href="https://wa.me/5562991639312?text=Olá, temos dias disponíveis?"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block w-full rounded-full bg-gold-300 px-6 py-2 text-center font-medium text-teal-900 transition-colors hover:bg-gold-400"
                onClick={() => setMobileNavOpen(false)}
              >
                Reservar
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative bg-teal-900 pb-32 pt-24 sm:pb-40 lg:pb-64 lg:pt-40">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/assets/backgrounds/waves-header.png"
            alt="Background waves"
            fill
            className="object-cover opacity-90"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h1
              className="mb-6 font-heading text-4xl tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              A Moita: Natureza que acolhe, tempo que devolve.
            </motion.h1>
            <motion.p
              className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-white/90 md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Conexão profunda com a natureza, simplicidade que acolhe e
              hospitalidade regenerativa no coração do Cerrado.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <a
                href="https://wa.me/5562991639312?text=Olá, gostaria de fazer uma reserva"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex transform items-center justify-center rounded-full bg-lime-500 px-8 py-4 text-lg font-medium text-teal-900 transition-colors duration-300 hover:scale-105 hover:bg-lime-400"
              >
                Reservar Agora
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="-mx-4 flex flex-wrap">
            <div className="mb-10 w-full px-4 sm:w-1/2 lg:w-1/4">
              <div className="text-center">
                <h3 className="mb-3 text-3xl font-medium text-teal-800 lg:text-4xl">
                  3.040 m²
                </h3>
                <p className="text-gray-700">
                  Natureza preservada às margens do Capivari
                </p>
              </div>
            </div>
            <div className="mb-10 w-full px-4 sm:w-1/2 lg:w-1/4">
              <div className="text-center">
                <h3 className="mb-3 text-3xl font-medium text-teal-800 lg:text-4xl">
                  4 unidades
                </h3>
                <p className="text-gray-700">
                  Chalés e cabanas exclusivas para descanso
                </p>
              </div>
            </div>
            <div className="mb-10 w-full px-4 sm:w-1/2 lg:w-1/4">
              <div className="text-center">
                <h3 className="mb-3 text-3xl font-medium text-teal-800 lg:text-4xl">
                  80%+ área permeável
                </h3>
                <p className="text-gray-700">Conexão real com o Cerrado vivo</p>
              </div>
            </div>
            <div className="mb-10 w-full px-4 sm:w-1/2 lg:w-1/4">
              <div className="text-center">
                <h3 className="mb-3 text-3xl font-medium text-teal-800 lg:text-4xl">
                  100+ hóspedes
                </h3>
                <p className="text-gray-700">
                  Experiências autênticas já compartilhadas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="nossos-pilares" className="bg-white p-4">
        <div className="rounded-3xl bg-lime-500 px-5 pb-24 pt-16 xs:px-8 xl:px-12">
          <div className="container mx-auto px-4">
            <div className="mb-4 flex items-center">
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="4" cy="4" r="4" fill="#022C22" />
              </svg>
              <span className="ml-2 inline-block text-sm font-medium">
                Nossos Pilares
              </span>
            </div>
            <div className="border-t border-teal-900 border-opacity-25 pt-14">
              <h1 className="mb-24 font-heading text-4xl sm:text-6xl">
                O que nos move e inspira
              </h1>
              <div className="-mx-4 flex flex-wrap">
                {solutions.map((solution, index) => (
                  <motion.div
                    key={solution.title}
                    className="mb-16 w-full px-4 sm:w-1/2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div>
                      {solution.icon}
                      <div className="mt-6">
                        <h5 className="mb-3 text-2xl font-medium">
                          {solution.title}
                        </h5>
                        <p className="mb-6">{solution.description}</p>
                        <Link
                          href="#"
                          className="inline-block text-lg font-medium transition-colors hover:text-teal-700"
                        >
                          Read more
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept Section with Origem Images */}
      <section id="chales" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="-mx-4 flex flex-col items-center md:flex-row">
            {/* Left Column - Text Content */}
            <div className="mb-10 w-full px-4 md:mb-0 md:w-1/2">
              <div className="mx-auto max-w-lg md:mx-0">
                <h2 className="mb-6 text-3xl font-medium text-teal-900 md:text-4xl lg:text-5xl">
                  Entre árvores e silêncios, devolvemos o essencial: tempo,
                  presença e vida plena.
                </h2>
                <p className="mb-8 text-lg text-gray-700">
                  Descubra um refúgio onde a natureza e o conforto se encontram,
                  criando experiências que renovam corpo e alma.
                </p>
                <a
                  href="#reservar"
                  className="inline-block rounded-full bg-teal-900 px-8 py-3 font-medium text-white transition-colors hover:bg-teal-800"
                >
                  Reservar Agora
                </a>
              </div>
            </div>

            {/* Right Column - Image Grid */}
            <div className="w-full px-4 md:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src="/assets/gallery/gallery-1.jpg"
                    alt="Natureza e tranquilidade"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src="/assets/gallery/gallery-2.jpg"
                    alt="Momento de paz"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src="/assets/gallery/gallery-3.jpg"
                    alt="Experiência única"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src="/assets/gallery/gallery-4.jpg"
                    alt="Conexão com a natureza"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <Commitment />

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <footer
        className="relative py-12 lg:py-16"
        style={{ backgroundColor: '#f3efe8' }}
      >
        <Image
          className="absolute bottom-0 left-0"
          src="/assets/backgrounds/waves-footer.png"
          alt=""
          width={200}
          height={200}
          priority
        />
        <div className="container relative mx-auto px-4">
          <div className="mb-12 flex flex-col justify-between lg:flex-row">
            <div className="mb-8 lg:mb-0">
              <Link className="mb-6 inline-block" href="/">
                <Image
                  src="/assets/branding/logo.svg"
                  alt="A Moita"
                  width={120}
                  height={40}
                />
              </Link>
              <div className="mt-4 flex space-x-4">
                <a
                  href="https://www.instagram.com/moitanativa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="h-6 w-6 text-teal-900 transition-colors hover:text-lime-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.415-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.415-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-1.281.22-2.33.678-3.21a5.5 5.5 0 013.21-3.21c.88-.457 1.929-.678 3.21-.678h.63c1.429 0 1.784.013 2.808.06.102.005.203.011.303.017v2.198h-1.22c-1.323 0-1.747.06-2.32.246a3.28 3.28 0 00-1.8 1.8c-.185.573-.245.997-.245 2.32v1.47c0 1.323.06 1.747.245 2.32.42 1.3 1.52 2.4 2.82 2.82.573.185.997.245 2.32.245h1.47c1.323 0 1.747-.06 2.32-.245a3.28 3.28 0 001.8-1.8c.185-.573.245-.997.245-2.32v-1.47c0-1.323-.06-1.747-.245-2.32a3.28 3.28 0 00-1.8-1.8c-.573-.185-.997-.245-2.32-.245h-1.1v-2.22c.1-.006.2-.012.303-.017 1.024-.047 1.379-.06 3.808-.06zM12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm0 5.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@moitanativa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="h-6 w-6 text-teal-900 transition-colors hover:text-lime-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.43.27-.83.63-1.01 1.07-.36.88-.32 1.83-.3 2.76.1 1.09.81 2.16 1.83 2.5 1.2.4 2.62-.1 3.31-1.08.23-.33.43-.69.48-1.09.1-.74.16-1.47.17-2.21.14-1.24-.06-2.7-.26-3.7.81.56 1.73.95 2.6 1.44.45.25.94.51 1.35.85.21.18.45.32.7.44.1.05.2.1.3.14.1.03.2.07.31.08.1.02.2.03.3.03.1 0 .2-.01.3-.03.1-.01.2-.05.31-.08.1-.04.2-.09.3-.14.25-.11.49-.26.7-.44.41-.34.9-.6 1.35-.85.87-.49 1.79-.88 2.6-1.44v-4.64c-1.63.1-3.26.05-4.89.04-.01 1.17.03 2.35-.01 3.52-.56-.38-1.23-.67-1.89-.9-1.1-.39-2.26-.57-3.43-.7-.12-.02-.24-.02-.36-.02-1.23 0-2.46.11-3.66.36-1.48.31-2.92.91-4.2 1.76-1.26.84-2.27 1.99-2.91 3.32-.64 1.32-.9 2.79-.85 4.27.1 2.85 1.5 5.53 3.87 7.09 1.37.9 2.99 1.42 4.64 1.5 1.06.05 2.12-.03 3.16-.29 1.56-.39 3-1.14 4.2-2.2 1.2-1.06 2.03-2.45 2.4-3.99.2-.82.27-1.66.28-2.5.03-1.87.02-3.74.02-5.61 0-1.23.01-2.47 0-3.7.01-1.65 0-3.3 0-4.95z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                  Navegação
                </h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="text-base text-gray-600 transition-colors hover:text-lime-600"
                    >
                      Início
                    </a>
                  </li>
                  <li>
                    <a
                      href="#nossos-pilares"
                      className="text-base text-gray-600 transition-colors hover:text-lime-600"
                    >
                      Sobre
                    </a>
                  </li>
                  <li>
                    <a
                      href="#chales"
                      className="text-base text-gray-600 transition-colors hover:text-lime-600"
                    >
                      Chalés
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://wa.me/5562991639312?text=Olá, gostaria de fazer uma reserva"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-gray-600 transition-colors hover:text-lime-600"
                    >
                      Reservar
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                Contato
              </h3>
              <address className="mt-4 text-base not-italic text-gray-600">
                <p>Rio Capivari, Abadiânia-GO</p>
                <a
                  href="mailto:contato@moitanativa.com.br"
                  className="mt-2 block transition-colors hover:text-lime-600"
                >
                  contato@moitanativa.com.br
                </a>
              </address>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-center text-base text-gray-500">
              &copy; 2025 A Moita. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
