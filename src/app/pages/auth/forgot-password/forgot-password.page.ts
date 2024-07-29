import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  form = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
  })

  firebaseSvc = inject(FirebaseService)
  utilSVC = inject(UtilsService)

  ngOnInit() {
  }

  async submit(){
    if (this.form.valid) {

      const loading = await this.utilSVC.loading();
      await loading.present();

      this.firebaseSvc.sendRecoveryEmail(this.form.value.email).then(res => {
        
        this.utilSVC.presentToast({
          message: 'Correo enviado con éxito',
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'mail-outline'
        });

        this.utilSVC.routerLink('/auth');
        this.form.reset();


      }).catch(error => {
        console.log(error);

        this.utilSVC.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        })
        
      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  

}
