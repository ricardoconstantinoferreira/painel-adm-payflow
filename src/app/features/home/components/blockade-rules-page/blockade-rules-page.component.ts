import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthSessionService } from '../../../../services/auth-session.service';
import { BlockadeRule } from '../../interfaces/blockade-rule.interface';
import { BlockadeRulesService } from '../../services/blockade-rules.service';

@Component({
  selector: 'app-blockade-rules-page',
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './blockade-rules-page.component.html',
  styleUrl: './blockade-rules-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockadeRulesPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly blockadeRulesService = inject(BlockadeRulesService);

  private readonly emptyFormValue = {
    qty: '',
    parameter: '',
    typeParameter: '0',
  };

  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly submitSuccess = signal<string | null>(null);
  readonly rules = signal<BlockadeRule[]>([]);
  readonly isRemoveModalOpen = signal(false);
  readonly selectedRuleId = signal<string | null>(null);

  readonly typeParameterOptions = [
    { value: '0', label: 'Minutos' },
    { value: '1', label: 'Horas' },
    { value: '2', label: 'Dias' },
  ];

  readonly blockadeForm = this.formBuilder.nonNullable.group({
    qty: [this.emptyFormValue.qty, [Validators.required]],
    parameter: [this.emptyFormValue.parameter, [Validators.required]],
    typeParameter: [this.emptyFormValue.typeParameter, [Validators.required]],
  });

  constructor() {
    this.loadRules();
  }

  get hasRules(): boolean {
    return this.rules().length > 0;
  }
  get showForm(): boolean {
    return !this.hasRules;
  }
  get qtyControl() {
    return this.blockadeForm.controls.qty;
  }
  get parameterControl() {
    return this.blockadeForm.controls.parameter;
  }
  get typeParameterControl() {
    return this.blockadeForm.controls.typeParameter;
  }

  onLogout(): void {
    this.authSessionService.clearSession();
    void this.router.navigate(['/']);
  }

  onClear(): void {
    this.blockadeForm.reset(this.emptyFormValue);
    this.loadError.set(null);
    this.submitSuccess.set(null);
  }

  onSubmit(): void {
    if (this.blockadeForm.invalid) {
      this.blockadeForm.markAllAsTouched();
      this.submitSuccess.set(null);
      this.loadError.set(null);
      return;
    }

    const payload = {
      qty: this.parseIntegerValue(this.qtyControl.getRawValue()),
      parameter: this.parameterControl.getRawValue().trim(),
      typeParameter: this.parseIntegerValue(
        this.typeParameterControl.getRawValue(),
      ),
    };

    this.isSubmitting.set(true);
    this.loadError.set(null);
    this.submitSuccess.set(null);

    this.blockadeRulesService
      .createBlockade(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.submitSuccess.set('Regra de bloqueio cadastrada com sucesso.');
          this.blockadeForm.reset(this.emptyFormValue);
          this.loadRules();
        },
        error: (error: HttpErrorResponse) => {
          this.submitSuccess.set(null);
          this.loadError.set(
            this.getRequestErrorMessage(error) ??
              'Nao foi possivel cadastrar a regra de bloqueio.',
          );
        },
      });
  }

  openRemoveModal(ruleId: string): void {
    this.selectedRuleId.set(ruleId);
    this.isRemoveModalOpen.set(true);
  }

  backToList(): void {
    this.isRemoveModalOpen.set(false);
    this.selectedRuleId.set(null);
  }

  onRemove(ruleId?: string): void {
    const id = ruleId ?? this.selectedRuleId();
    if (!id) return;

    this.isRemoveModalOpen.set(false);
    this.blockadeRulesService
      .deleteById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedRuleId.set(null);
          this.loadRules();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao remover regra de bloqueio:', error);
          this.selectedRuleId.set(null);
          this.loadError.set(
            `Falha ao remover a regra ${id}. Tente novamente.`,
          );
        },
      });
  }

  getTypeParameterDescription(typeParameter: number): string {
    if (typeParameter === 0) return 'Minutos';
    if (typeParameter === 1) return 'Horas';
    return 'Dias';
  }

  private loadRules(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.blockadeRulesService
      .getBlockades()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const rules = this.mapResponseToRules(response);
          this.rules.set(rules);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set(
            'Nao foi possivel carregar as regras de bloqueio.',
          );
          this.rules.set([]);
        },
      });
  }

  private mapResponseToRules(response: unknown): BlockadeRule[] {
    if (Array.isArray(response)) {
      return response.map((item) => this.mapToRule(item));
    }
    if (response && typeof response === 'object') {
      return [this.mapToRule(response as Record<string, unknown>)];
    }
    return [];
  }

  private mapToRule(item: Record<string, unknown>): BlockadeRule {
    return {
      id: String(item['id'] ?? ''),
      qty: this.parseIntegerValue(String(item['qty'] ?? '0')),
      parameter: String(item['parameter'] ?? ''),
      typeParameter: this.parseIntegerValue(
        String(item['typeParameter'] ?? '0'),
      ),
    };
  }

  private parseIntegerValue(value: string): number {
    const parsedValue = Number.parseInt(value, 10);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private getRequestErrorMessage(error: HttpErrorResponse): string | null {
    const err = error.error;
    if (!err) return null;
    if (typeof err === 'string') return err;
    return typeof err === 'object' &&
      err !== null &&
      'message' in err &&
      typeof err.message === 'string'
      ? err.message
      : null;
  }
}
