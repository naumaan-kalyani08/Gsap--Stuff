gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const lowPowerMode = prefersReducedMotion || (isSafari && ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4)));

    if (!lowPowerMode) {
        const lenis = new Lenis();
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    document.body.classList.toggle("low-power-mode", lowPowerMode);

    const heroSection = document.querySelector(".hero");
    const heroBackground = document.querySelector(".hero-bg");
    const heroContent = document.querySelector(".hero-content");
    const heroRevealer = document.querySelector(".hero-revealer");
    const heroImagesWrapper = document.querySelector(".hero-images");
    const heroImages = gsap.utils.toArray(".hero-img");
    const heroOutroContent = document.querySelector(".hero-outro-content");

    gsap.set(heroImagesWrapper, { scale: 1 });

    if (lowPowerMode) {
        gsap.set(heroBackground, { scale: 1 });
        gsap.set(heroRevealer, { autoAlpha: 0 });
        gsap.set(heroImages, { clipPath: "none", scale: 1, opacity: 0 });
        gsap.set(heroOutroContent, { scale: 1, opacity: 0 });

        const heroScrollTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: () => `+=${window.innerHeight * 4.2}`,
                pin: true,
                pinSpacing: false,
                scrub: true,
                invalidateOnRefresh: true,
            }
        });

        heroScrollTimeline.to(heroBackground, { scale: 1, duration: 0.3 }, 0);
        heroScrollTimeline.to(heroContent, { opacity: 0, duration: 0.12 }, 0.12);
        heroScrollTimeline.to(heroImages, {
            opacity: 1,
            duration: 0.18,
            stagger: 0.08,
            ease: "power1.out"
        }, 0.22);
        heroScrollTimeline.to(heroOutroContent, {
            opacity: 1,
            duration: 0.22,
            ease: "power1.out"
        }, 0.55);
        heroScrollTimeline.set(heroSection, { backgroundColor: "transparent" }, 0.88);
    } else {
        // Clone outro
        const heroOutroClone = heroOutroContent.cloneNode(true);
        heroOutroContent.classList.add("hero-outro-left");
        heroOutroClone.classList.add("hero-outro-right");
        heroOutroContent.parentNode.appendChild(heroOutroClone);

        gsap.set(".hero-outro-left", { clipPath: "polygon(0% 0, 50% 0, 50% 100%, 0% 100%)" });
        gsap.set(".hero-outro-right", { clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" });

        const heroScrollTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: () => `+=${window.innerHeight * 5.8}`,
                pin: true,
                pinSpacing: false,
                scrub: true,
                invalidateOnRefresh: true,
            }
        });

        // === PHASE 1: Initial Reveal ===
        heroScrollTimeline.to(heroBackground, { scale: 1, duration: 0.5 }, 0);

        // First: thin vertical slit
        heroScrollTimeline.to(heroRevealer, {
            clipPath: "polygon(49.5% 0%, 50.5% 0%, 50.5% 100%, 49.5% 100%)",
            duration: 0.15
        }, 0);

        // Second: full reveal (this is the main clipPath animation)
        heroScrollTimeline.to(heroRevealer, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.35
        }, 0.15);

        // === START IMAGES WHEN CLIP PATH IS 80% COMPLETE ===
        const clipPathTotalDuration = 0.15 + 0.35;
        const clipPath80PercentTime = clipPathTotalDuration * 0.8;

        const cascadeStart = clipPath80PercentTime;

        const cascadeStagger = 0.16;
        const cascadeDuration = 0.20;

        heroImages.forEach((heroImage, index) => {
            heroScrollTimeline.to(heroImage, {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                scale: 1,
                duration: cascadeDuration,
                ease: "power2.out"
            }, cascadeStart + index * cascadeStagger);
        });

        // === OUTRO TIMING (adjusted relative to cascade) ===
        const outroStart = cascadeStart + (heroImages.length - 1) * cascadeStagger + 0.12;

        heroScrollTimeline.to(".hero-outro-content", {
            scale: 1,
            duration: 0.32,
            ease: "power2.out"
        }, outroStart);

        // Final fade + split transition
        const fadeOutStart = outroStart + 0.16;

        heroScrollTimeline.set(
            [heroBackground, heroContent, heroRevealer, heroImagesWrapper],
            { autoAlpha: 0 },
            fadeOutStart
        );

        heroScrollTimeline.set(heroSection, { backgroundColor: "transparent" }, fadeOutStart);

        heroScrollTimeline.to(".hero-outro-left", {
            xPercent: -100,
            duration: 0.35,
            // ease: "power2.inOut"
        }, fadeOutStart);

        heroScrollTimeline.to(".hero-outro-right", {
            xPercent: 100,
            duration: 0.35,
            // ease: "power2.inOut"
        }, fadeOutStart);
    }
});