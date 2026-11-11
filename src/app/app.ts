import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';

type Language = 'de' | 'en';
type LinkKey = 'etsy' | 'instagram';

interface SocialLink {
  key: LinkKey;
  href: string;
  icon: string;
  colors: string;
  label: Record<Language, string>;
}

const CONTENT = {
  de: {
    languageLabel: 'Sprache wechseln',
  },
  en: {
    languageLabel: 'Change language',
  },
} as const;

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('page', { static: true }) private page!: ElementRef<HTMLElement>;

  private readonly document = inject(DOCUMENT);
  private animationContext?: gsap.Context;

  protected readonly language = signal<Language>(this.getInitialLanguage());
  protected readonly copy = computed(() => CONTENT[this.language()]);

  // Replace these URLs if your public handles differ from "shibabox".
  protected readonly links: readonly SocialLink[] = [
    {
      key: 'etsy',
      href: 'https://www.etsy.com/shop/Shibabox',
      icon: '/icons/etsy.svg',
      colors: 'bg-[#f2b705] text-[#30180d]',
      label: { de: 'Zum Etsy-Shop', en: 'Visit Etsy shop' },
    },
    {
      key: 'instagram',
      href: 'https://www.instagram.com/shibabox/',
      icon: '/icons/instagram.svg',
      colors: 'bg-[#f47c48] text-[#30180d]',
      label: { de: 'Zu Instagram', en: 'Open Instagram' },
    },
  ];

  ngAfterViewInit(): void {
    this.animationContext = gsap.context(() => {
      const reduceMotion = this.prefersReducedMotion();

      if (reduceMotion) {
        gsap.set('[data-reveal]', { clearProps: 'all' });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .from('.profile-card', { y: 18, scale: 0.99, autoAlpha: 0, duration: 0.7 })
        .from('[data-reveal]', { y: 10, autoAlpha: 0, duration: 0.45, stagger: 0.06 }, '-=0.4');
    }, this.page.nativeElement);
  }

  ngOnDestroy(): void {
    this.animationContext?.revert();
  }

  protected setLanguage(language: Language): void {
    if (language === this.language()) return;

    this.language.set(language);
    this.document.documentElement.lang = language;

    if (this.prefersReducedMotion()) return;

    requestAnimationFrame(() => {
      gsap.fromTo(
        '.language-copy',
        { y: 7, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.38, stagger: 0.025, ease: 'power2.out' },
      );
    });
  }

  private getInitialLanguage(): Language {
    if (typeof navigator === 'undefined') return 'de';
    return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en';
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
