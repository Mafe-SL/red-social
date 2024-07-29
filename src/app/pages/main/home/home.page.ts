import { Component, inject, OnInit } from '@angular/core';
import { Publicacion } from 'src/app/models/publicacion.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdatePublicacionComponent } from 'src/app/shared/components/add-update-publicacion/add-update-publicacion.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  publicaciones: Publicacion[] = [];

  ngOnInit() {
  }

  user(): User{
    return this.utilsSvc.getFromLocalStorage('user')
  }

  ionViewWillEnter() {
    this.getProducts();
  }

  // -- Obtener productos --
  getProducts(){
    let path = `users/${this.user().uid}/publicaciones`;

    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        console.log(res);
        this.publicaciones = res;
        sub.unsubscribe;
        
      }
    })

  }
  

  // -- Agregar Publicación --
  addUpdateProduct() {
    this.utilsSvc.presentModal({
      component: AddUpdatePublicacionComponent,
      cssClass: 'add-update-modal'
    })
  }

}
