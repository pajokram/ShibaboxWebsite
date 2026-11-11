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
import { Language, LanguageSwitch } from './language-switch/language-switch';

type LinkKey = 'etsy' | 'email' | 'instagram';

interface SocialLink {
  key: LinkKey;
  href: string;
  icon: string;
  classes: string;
  external: boolean;
  label: Record<Language, string>;
}

const CONTENT = {
  de: {
    languageLabel: 'Sprache wechseln',
    introTitle: 'Hi, wir sind Shibabox!',
    introText:
      'Wir sind ein kleiner Shop für Sticker, handgebundene Notizbücher, Karten und anderen kreativen Kram. Oft mit Shibas, immer mit Herz und einer gesunden Menge Quatsch.',
  },
  en: {
    languageLabel: 'Change language',
    introTitle: 'Hi, we’re Shibabox!',
    introText:
      'A small stationery business making stickers, hand-bound notebooks and cards. Often with Shibas, always with heart and a healthy amount of silliness.',
  },
} as const;

@Component({
  selector: 'app-root',
  imports: [LanguageSwitch],
  templateUrl: './app.html',
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('page', { static: true }) private page!: ElementRef<HTMLElement>;

  private readonly cardWidth = 480;
  private readonly cardHeight = 576;
  private readonly document = inject(DOCUMENT);
  private animationContext?: gsap.Context;
  private cardResizeObserver?: ResizeObserver;

  protected readonly language = signal<Language>(this.getInitialLanguage());
  protected readonly copy = computed(() => CONTENT[this.language()]);
  protected readonly cardScale = signal(1);
  protected readonly cardFrameWidth = computed(() => this.cardWidth * this.cardScale());
  protected readonly cardFrameHeight = computed(() => this.cardHeight * this.cardScale());

  // Replace these URLs if your public handles differ from "shibabox".
  protected readonly links: readonly SocialLink[] = [
    {
      key: 'etsy',
      href: 'https://www.etsy.com/shop/shibabox',
      icon: '/icons/etsy.svg',
      classes: '-rotate-[0.3deg]',
      external: true,
      label: { de: 'Etsy-Shop', en: 'Etsy shop' },
    },
    {
      key: 'instagram',
      href: 'https://www.instagram.com/shibabox/',
      icon: '/icons/instagram.svg',
      classes: '-rotate-[0.15deg]',
      external: true,
      label: { de: 'shibabox_de', en: 'shibabox_de' },
    },
    {
      key: 'email',
      href: 'mailto:shiba-box@gmx.de',
      icon: '/icons/mail.svg',
      classes: 'rotate-[0.2deg]',
      external: false,
      label: { de: 'E-Mail schreiben', en: 'Send an email' },
    },
  ];

  ngAfterViewInit(): void {
    this.updateCardFrame();

    const ResizeObserverClass = this.document.defaultView?.ResizeObserver;
    if (ResizeObserverClass) {
      this.cardResizeObserver = new ResizeObserverClass(() => this.updateCardFrame());
      this.cardResizeObserver.observe(this.page.nativeElement);
    }

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
    this.cardResizeObserver?.disconnect();
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

  private updateCardFrame(): void {
    const view = this.document.defaultView;
    if (!view) return;

    const page = this.page.nativeElement;
    const styles = view.getComputedStyle(page);
    const availableWidth =
      page.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const availableHeight =
      page.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    const scale = Math.min(1, availableWidth / this.cardWidth, availableHeight / this.cardHeight);

    this.cardScale.set(Math.max(0.1, scale));
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
