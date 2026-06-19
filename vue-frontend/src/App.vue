<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const heroImages = [
  {
    src: new URL('../../Plain-frontend/landing-page-with-reveal-effect/Assets/hero-1.jpg', import.meta.url).href,
    alt: 'Luxury interior view one',
  },
  {
    src: new URL('../../Plain-frontend/landing-page-with-reveal-effect/Assets/hero-2.jpg', import.meta.url).href,
    alt: 'Luxury interior view two',
  },
  {
    src: new URL('../../Plain-frontend/landing-page-with-reveal-effect/Assets/hero-4.jpg', import.meta.url).href,
    alt: 'Luxury interior view three',
  },
]

const itineraryDays = [
  {
    number: '01',
    title: 'Arrival & Iconic Paris',
    date: 'Day One',
    image: 'https://picsum.photos/id/1015/1200/600',
    alt: 'Eiffel Tower',
    activities: [
      { label: 'Morning', text: 'Private transfer & hotel check-in at Le Marais' },
      { label: 'Afternoon', text: 'Eiffel Tower summit + Seine River private cruise' },
      { label: 'Evening', text: 'Dinner at a Michelin-starred restaurant' },
    ],
  },
  {
    number: '02',
    title: 'Art & Heritage',
    date: 'Day Two',
    image: 'https://picsum.photos/id/201/1200/600',
    alt: 'Louvre',
    activities: [
      { label: 'Morning', text: 'Private guided tour of the Louvre' },
      { label: 'Afternoon', text: 'Notre-Dame & Sainte-Chapelle' },
      { label: 'Evening', text: 'Montmartre & Sacré-Cœur at sunset' },
    ],
  },
  {
    number: '03',
    title: 'Versailles Escape',
    date: 'Day Three',
    image: 'https://picsum.photos/id/1016/1200/600',
    alt: 'Versailles',
    activities: [
      { label: 'Full Day', text: 'Private tour of Palace of Versailles & Gardens' },
      { label: 'Evening', text: 'Return with wine tasting in Paris' },
    ],
  },
]

const appRef = ref(null)
let teardown = () => {}

onMounted(() => {
  const root = appRef.value

  if (!root) {
    return
  }

  const lenis = new Lenis()
  const onScroll = () => ScrollTrigger.update()
  const onTicker = (time) => lenis.raf(time * 1000)

  lenis.on('scroll', onScroll)
  gsap.ticker.add(onTicker)
  gsap.ticker.lagSmoothing(0)

  const heroSection = root.querySelector('.hero')
  const heroBackground = root.querySelector('.hero-bg')
  const heroContent = root.querySelector('.hero-content')
  const heroRevealer = root.querySelector('.hero-revealer')
  const heroImagesWrapper = root.querySelector('.hero-images')
  const heroImagesElements = Array.from(root.querySelectorAll('.hero-img'))
  const heroOutroContent = root.querySelector('.hero-outro-content')

  if (
    !heroSection
    || !heroBackground
    || !heroContent
    || !heroRevealer
    || !heroImagesWrapper
    || !heroImagesElements.length
    || !heroOutroContent
  ) {
    gsap.ticker.remove(onTicker)
    lenis.destroy()
    return
  }

  const heroOutroClone = heroOutroContent.cloneNode(true)
  heroOutroContent.classList.add('hero-outro-left')
  heroOutroClone.classList.add('hero-outro-right')
  heroOutroContent.parentNode.appendChild(heroOutroClone)

  gsap.set('.hero-outro-left', { clipPath: 'polygon(0% 0, 50% 0, 50% 100%, 0% 100%)' })
  gsap.set('.hero-outro-right', { clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' })
  gsap.set(heroImagesWrapper, { scale: 1 })

  const heroScrollTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: () => `+=${window.innerHeight * 5.8}`,
      pin: true,
      pinSpacing: false,
      scrub: true,
      invalidateOnRefresh: true,
    },
  })

  heroScrollTimeline.to(heroBackground, { scale: 1, duration: 0.5 }, 0)
  heroScrollTimeline.to(heroRevealer, {
    clipPath: 'polygon(49.5% 0%, 50.5% 0%, 50.5% 100%, 49.5% 100%)',
    duration: 0.15,
  }, 0)

  heroScrollTimeline.to(heroRevealer, {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    duration: 0.35,
  }, 0.15)

  const clipPathTotalDuration = 0.15 + 0.35
  const clipPath80PercentTime = clipPathTotalDuration * 0.8
  const cascadeStart = clipPath80PercentTime
  const cascadeStagger = 0.16
  const cascadeDuration = 0.2

  heroImagesElements.forEach((heroImage, index) => {
    heroScrollTimeline.to(heroImage, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      scale: 1,
      duration: cascadeDuration,
      ease: 'power2.out',
    }, cascadeStart + index * cascadeStagger)
  })

  const outroStart = cascadeStart + (heroImagesElements.length - 1) * cascadeStagger + 0.12

  heroScrollTimeline.to('.hero-outro-content', {
    scale: 1,
    duration: 0.32,
    ease: 'power2.out',
  }, outroStart)

  const fadeOutStart = outroStart + 0.38

  heroScrollTimeline.set([heroBackground, heroContent, heroRevealer, heroImagesWrapper], { autoAlpha: 0 }, fadeOutStart)
  heroScrollTimeline.set(heroSection, { backgroundColor: 'transparent' }, fadeOutStart)
  heroScrollTimeline.to('.hero-outro-left', { xPercent: -100, duration: 0.55 }, fadeOutStart)
  heroScrollTimeline.to('.hero-outro-right', { xPercent: 100, duration: 0.55 }, fadeOutStart)

  teardown = () => {
    heroScrollTimeline.scrollTrigger?.kill()
    heroScrollTimeline.kill()
    gsap.ticker.remove(onTicker)
    lenis.destroy()
    heroOutroClone.remove()
    heroOutroContent.classList.remove('hero-outro-left')
  }
})

onBeforeUnmount(() => {
  teardown()
})
</script>

<template>
  <div ref="appRef" class="landing-page">
    <section class="hero">
      <div class="hero-bg">
        <img src="../../Plain-frontend/landing-page-with-reveal-effect/Assets/hero-bg.jpg" alt="Luxury living background" />
      </div>
      <div class="hero-content">
        <h1>A Modern Approach to luxury living and timeless spaces</h1>
      </div>
      <div class="hero-revealer"></div>

      <div class="hero-images">
        <div v-for="image in heroImages" :key="image.src" class="hero-img">
          <img :src="image.src" :alt="image.alt" />
        </div>
      </div>
      <div class="hero-outro-content">
        <h1>Thoroughly crafted spaces designed to inspire modern living connection</h1>
      </div>
    </section>

    <section class="about">
      <div class="about-content">
        <h3>Designing digital experiences that feel effortless</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, harum obcaecati aperiam dolorum, neque illo beatae porro quisquam ipsum omnis consequatur, commodi tenetur sapiente repudiandae consequuntur voluptas quis similique possimus.
        </p>
      </div>
    </section>

    <section class="itinerary">
      <div class="itinerary-container">
        <h2 class="section-title">Signature 7-Day Paris Experience</h2>
        <p class="section-subtitle">Curated moments in the City of Light</p>

        <div class="itinerary-timeline">
          <div v-for="day in itineraryDays" :key="day.number" class="day">
            <div class="day-image">
              <img :src="day.image" :alt="day.alt" />
            </div>
            <div class="day-header">
              <span class="day-number">{{ day.number }}</span>
              <div>
                <h4>{{ day.title }}</h4>
                <span class="day-date">{{ day.date }}</span>
              </div>
            </div>
            <ul class="activities">
              <li v-for="activity in day.activities" :key="`${day.number}-${activity.label}`">
                <strong>{{ activity.label }}:</strong> {{ activity.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
