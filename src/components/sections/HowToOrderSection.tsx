'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ShoppingBag, ChefHat, Truck, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: ShoppingBag,
    title: 'Choisissez',
    description: 'Parcourez notre carte et sélectionnez vos plats préférés',
    color: '#b5a07a',
  },
  {
    icon: ChefHat,
    title: 'On prépare',
    description: 'Nos chefs cuisinent vos plats avec des produits frais',
    color: '#b5a07a',
  },
  {
    icon: Truck,
    title: 'Livraison',
    description: 'Livré chez vous en moins de 30 minutes',
    color: '#b5a07a',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25 }
  }
}

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
}

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const t = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(t)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(t)
  }, [inView, target])

  return (
    <span ref={ref} className="text-4xl sm:text-5xl font-black" style={{ color: 'var(--primary)' }}>
      {count}{suffix}
    </span>
  )
}

export default function HowToOrderSection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{
              color: 'var(--primary)',
              background: 'rgba(181, 160, 122, 0.12)',
              border: '1px solid rgba(181, 160, 122, 0.2)',
            }}
          >
            Comment ça marche
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3 font-serif">
            3 étapes simples
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Commandez en ligne et dégustez chez vous
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="relative grid sm:grid-cols-3 gap-8 sm:gap-12 mb-16"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={stepVariants}
              className="relative text-center"
            >
              <div className="relative z-10">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: 'rgba(181, 160, 122, 0.12)',
                    border: '2px solid rgba(181, 160, 122, 0.3)',
                  }}
                >
                  <step.icon className="w-9 h-9" style={{ color: 'var(--primary)' }} />
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-sm font-bold"
                  style={{ background: 'var(--primary)' }}
                >
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">{step.description}</p>
              </div>

              {i < steps.length - 1 && (
                <div
                  className="hidden sm:block absolute top-10 left-[60%] w-[calc(80%)] h-0.5"
                  style={{
                    background: 'linear-gradient(to right, rgba(181,160,122,0.4), rgba(181,160,122,0.1))',
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl mb-8"
            style={{
              background: 'rgba(181, 160, 122, 0.08)',
              border: '1px solid rgba(181, 160, 122, 0.2)',
            }}
          >
            <span className="text-gray-600 font-medium">Livré en ~</span>
            <Counter target={30} suffix=" min" />
          </div>

          <div>
            <Link
              href="/commande"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              }}
            >
              Commander maintenant <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
