'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: 'Como faço para reservar?',
      answer: 'No momento, as reservas são feitas diretamente conosco para garantir um atendimento personalizado e a melhor experiência possível. Entre em contato através do nosso formulário ou telefone para verificar a disponibilidade e fazer sua reserva. Estamos ansiosos para te receber!'
    },
    {
      question: 'Quais são as comodidades do chalé?',
      answer: 'Nossos chalés oferecem uma experiência completa com 2 quartos aconchegantes, cozinha equipada, Wi-Fi disponível, estacionamento privativo e uma vista deslumbrante para o Cerrado. Além disso, você terá acesso a banheiras externas privativas para contemplação da natureza.'
    },
    {
      question: 'A Moita é pet-friendly?',
      answer: 'Sim, a Moita é pet-friendly! Sabemos que seu amigo de quatro patas faz parte da família. Para garantir o conforto de todos, pedimos que consulte nossas políticas para pets no momento da reserva.'
    },
    {
      question: 'Qual a melhor época para visitar?',
      answer: 'A região de Abadiânia, entre Anápolis e Pirenópolis, possui um clima tropical. A estação seca (maio a setembro) é ideal para atividades ao ar livre, com dias ensolarados e noites frescas. Já a estação chuvosa (outubro a abril) traz um Cerrado exuberante e verde, perfeito para quem busca tranquilidade e a beleza da natureza renovada.'
    },
    {
      question: 'Há atividades disponíveis na região?',
      answer: 'A Moita é um refúgio para desconexão, mas estamos estrategicamente localizados entre Anápolis e Pirenópolis. Na região, você pode explorar festividades regionais e a rica cultura local. Em nossa propriedade, a pesca nativa é livre no Rio Capivari, proporcionando momentos de paz e contato direto com a natureza.'
    }
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-12 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="font-heading text-4xl sm:text-6xl mb-6">Perguntas Frequentes</h2>
          <p className="text-gray-700">Encontre aqui as respostas para as dúvidas mais comuns sobre sua estadia.</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {faqItems.map((item, index) => (
            <div key={index} className="mb-4">
              <button
                onClick={() => toggleAccordion(index)}
                className="flex w-full py-6 px-8 items-center justify-between text-left shadow-md rounded-2xl bg-white hover:bg-gray-50 transition-colors"
                aria-expanded={activeIndex === index}
                aria-controls={`faq-${index}`}
              >
                <div className="pr-5">
                  <h3 className="text-lg font-medium">{item.question}</h3>
                </div>
                <span className="flex-shrink-0">
                  {activeIndex === index ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.69995 12H18.3" stroke="#1D1F1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5.69995V18.3" stroke="#1D1F1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5.69995 12H18.3" stroke="#1D1F1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </button>
              <div
                id={`faq-${index}`}
                className={`overflow-hidden transition-all duration-500 ${
                  activeIndex === index ? 'max-h-96 mt-4' : 'max-h-0'
                }`}
              >
                <div className="px-8 pb-6">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
