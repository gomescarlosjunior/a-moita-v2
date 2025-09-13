'use client'

import { motion } from 'framer-motion'

export default function Commitment() {
  return (
    <section id="chales" className="overflow-hidden py-12 lg:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-teal-800/80" />
          <div className="relative z-10 p-12 text-white md:p-16 lg:p-24">
            <h3 className="mb-6 font-heading text-3xl md:text-4xl">
              Acompanhe o nascimento do Chalé A Origem
            </h3>
            <p className="mb-8 max-w-2xl text-lg">
              Participe do nosso grupo no WhatsApp e viva, de perto, a
              construção do primeiro refúgio da Moita. Ao final, quem estiver
              conosco terá acesso a descontos exclusivos.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="https://chat.whatsapp.com/HWC5lSbOAagJWILwm9UrGV?mode=ems_copy_t"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-lime-500 px-8 py-3 text-base font-medium text-teal-900 transition-colors duration-200 hover:bg-lime-400"
              >
                Entrar no Grupo do WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
