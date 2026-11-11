import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type Language = 'de' | 'en';

@Component({
  selector: 'app-language-switch',
  templateUrl: './language-switch.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitch {
  readonly language = input.required<Language>();
  readonly label = input.required<string>();
  readonly languageChange = output<Language>();
  protected readonly options: readonly Language[] = ['de', 'en'];

  protected select(language: Language): void {
    if (language !== this.language()) {
      this.languageChange.emit(language);
    }
  }
}
