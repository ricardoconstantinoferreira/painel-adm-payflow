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
import { InstallmentRule } from '../../interfaces/installment-rule.interface';
import { InstallmentRulesService } from '../../services/installment-rules.service';

@Component({
  selector: 'app-installment-rules-page',
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './installment-rules-page.component.html',
  styleUrl: './installment-rules-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallmentRulesPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly installmentRulesService = inject(InstallmentRulesService);

  private readonly emptyRuleFormValue = {
    discount: '',
    installments: '',
    minimumValue: '',
  };

  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly submitSuccess = signal<string | null>(null);
  readonly rules = signal<InstallmentRule[]>([]);
  readonly isEditingRule = signal(false);
  readonly isRemoveModalOpen = signal(false);
  readonly selectedRuleId = signal<string | null>(null);

  readonly ruleForm = this.formBuilder.nonNullable.group({
    discount: [this.emptyRuleFormValue.discount, [Validators.required]],
    installments: [this.emptyRuleFormValue.installments, [Validators.required]],
    minimumValue: [this.emptyRuleFormValue.minimumValue, [Validators.required]],
  });

  constructor() {
    this.loadRules();
  }

  get hasRules(): boolean { return this.rules().length > 0; }
  get showForm(): boolean { return this.isEditingRule() || !this.hasRules; }
  get discountControl() { return this.ruleForm.controls.discount; }
  get installmentsControl() { return this.ruleForm.controls.installments; }
  get minimumValueControl() { return this.ruleForm.controls.minimumValue; }

  onMinimumValueInput(event: Event): void {
    const digitsOnly = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    if (!digitsOnly) return void this.ruleForm.controls.minimumValue.setValue('');
    this.ruleForm.controls.minimumValue.setValue(
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(digitsOnly) / 100),
    );
  }

  onEdit(ruleId: string): void {
    const rule = this.rules().find((item) => item.id === ruleId);

    if (!rule) {
      this.loadError.set(`Nao foi possivel carregar a regra ${ruleId}.`);
      return;
    }

    this.ruleForm.patchValue({
      discount: rule.discount,
      installments: rule.installments,
      minimumValue: rule.minimumValue,
    });
    this.isEditingRule.set(true);
    this.loadError.set(null);
    this.submitSuccess.set(null);
  }

  cancelEdit(): void {
    this.isEditingRule.set(false);
    this.ruleForm.reset(this.emptyRuleFormValue);
    this.loadError.set(null);
    this.submitSuccess.set(null);
  }

  openRemoveModal(ruleId: string): void {
    this.selectedRuleId.set(ruleId);
    this.isRemoveModalOpen.set(true);
  }

  backToForm(): void {
    this.isRemoveModalOpen.set(false);
    this.selectedRuleId.set(null);
  }

  onRemove(ruleId?: string): void {
    const id = ruleId ?? this.selectedRuleId();

    if (!id) return;

    this.isRemoveModalOpen.set(false);
    this.installmentRulesService
      .deleteById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedRuleId.set(null);
          this.loadRules();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao remover regra:', error);
          this.selectedRuleId.set(null);
          this.loadError.set(`Falha ao remover a regra ${id}. Tente novamente.`);
        },
      });
  }

  onLogout(): void {
    this.authSessionService.clearSession();
    void this.router.navigate(['/']);
  }

  onClear(): void {
    this.ruleForm.reset(this.emptyRuleFormValue);
    this.loadError.set(null);
    this.submitSuccess.set(null);
  }

  onSubmit(): void {
    if (this.ruleForm.invalid) {
      this.ruleForm.markAllAsTouched();
      this.submitSuccess.set(null);
      this.loadError.set(null);
      return;
    }

    const storeId = this.installmentRulesService.getLoggedStoreId();

    if (!storeId) {
      this.loadError.set('Store ID do usuario logado nao encontrado. Faca login novamente.');
      this.submitSuccess.set(null);
      return;
    }

    const payload = {
      installments: this.parseIntegerValue(this.installmentsControl.getRawValue()),
      fees: this.parseDecimalValue(this.discountControl.getRawValue()),
      minimalAmount: this.parseCurrencyToNumber(this.minimumValueControl.getRawValue()),
      storeId,
    };

    this.isSubmitting.set(true);
    this.loadError.set(null);
    this.submitSuccess.set(null);

    this.installmentRulesService
      .createStoreConfig(payload)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.submitSuccess.set(
            this.isEditingRule() ? 'Regra atualizada com sucesso.' : 'Regra cadastrada com sucesso.',
          );
          this.isEditingRule.set(false);
          this.ruleForm.reset(this.emptyRuleFormValue);
          this.loadRules();
        },
        error: (error: HttpErrorResponse) => {
          this.submitSuccess.set(null);
          this.loadError.set(
            this.getRequestErrorMessage(error) ?? 'Nao foi possivel cadastrar a regra de parcelamento.',
          );
        },
      });
  }

  private loadRules(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.installmentRulesService
      .getStoreConfig()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.rules.set(response == null ? [] : [{
            id: response.id,
            discount: response.fees,
            installments: response.installments,
            minimumValue: this.formatCurrencyValue(response.minimalAmount),
          }]);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Nao foi possivel carregar as regras de parcelamento.');
          this.rules.set([]);
        },
      });
  }

  private parseCurrencyToNumber(value: string): number {
    const digitsOnly = value.replace(/\D/g, '');
    return !digitsOnly ? 0 : Number(digitsOnly) / 100;
  }

  private formatCurrencyValue(value: unknown): string {
    const num = typeof value === 'number' ? value : Number(value);
    return !Number.isFinite(num)
      ? 'R$ 0,00'
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  }

  private parseDecimalValue(value: string): number {
    const parsed = Number(value.replace('%', '').trim().replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private parseIntegerValue(value: string): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private getRequestErrorMessage(error: HttpErrorResponse): string | null {
    const err = error.error;

    if (!err) return null;
    if (typeof err === 'string') return err;
    return typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string'
      ? err.message
      : null;
  }
}