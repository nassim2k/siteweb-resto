'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import CategoriesSection from '@/components/sections/CategoriesSection'

const PopularProductsSection = dynamic(
  () => import('@/components/sections/PopularProductsSection'),
  { loading: () => <div className="py-24 text-center text-gray-400">Chargement...</div> }
)

const HowToOrderSection = dynamic(
  () => import('@/components/sections/HowToOrderSection'),
  { loading: () => <div className="py-24 text-center text-gray-400">Chargement...</div> }
)

const ReviewsSection = dynamic(
  () => import('@/components/sections/ReviewsSection'),
  { loading: () => <div className="py-24 text-center text-gray-400">Chargement...</div> }
)

import Footer from '@/components/layout/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <PopularProductsSection />
      <HowToOrderSection />
      <ReviewsSection />
      <Footer />
    </div>
  )
}
