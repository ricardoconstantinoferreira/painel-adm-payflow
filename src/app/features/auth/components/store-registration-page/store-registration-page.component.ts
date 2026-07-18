import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { StoreRegistrationPayload } from '../../interfaces/store-registration-payload.interface';
import { StoreRegistrationService } from '../../services/store-registration.service';

@Component({
  selector: 'app-store-registration-page',
  imports: [ReactiveFormsModule],
  templateUrl: './store-registration-page.component.html',
  styleUrl: './store-registration-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreRegistrationPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storeRegistrationService = inject(StoreRegistrationService);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSuccessModalOpen = signal(false);

  readonly storeForm = this.formBuilder.nonNullable.group({
    storeDescription: ['', [Validators.required, Validators.minLength(3)]],
    storeEmail: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    webhook: ['', [Validators.required]],
  });

  get storeDescriptionControl() {
    return this.storeForm.controls.storeDescription;
  }

  get storeEmailControl() {
    return this.storeForm.controls.storeEmail;
  }

  get passwordControl() {
    return this.storeForm.controls.password;
  }

  get webhookControl() {
    return this.storeForm.controls.webhook;
  }

  onClear(): void {
    this.storeForm.reset({
      storeDescription: '',
      storeEmail: '',
      password: '',
      webhook: '',
    });
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.storeForm.invalid) {
      this.storeForm.markAllAsTouched();
      this.errorMessage.set(null);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload: StoreRegistrationPayload = {
      description: this.storeForm.controls.storeDescription.getRawValue(),
      email: this.storeForm.controls.storeEmail.getRawValue(),
      password: this.storeForm.controls.password.getRawValue(),
      webhook: this.storeForm.controls.webhook.getRawValue(),
    };

    this.storeRegistrationService
      .registerStore(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.isSuccessModalOpen.set(true);
        },
        error: (error) => {
          this.errorMessage.set(
            'Nao foi possivel cadastrar a loja. Revise os dados e tente novamente.',
          );
        },
      });
  }

  closeSuccessModal(): void {
    this.isSuccessModalOpen.set(false);
    void this.router.navigate(['']);
  }
}
