import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Producto } from './producto.model';
import { ProductoPopupService } from './producto-popup.service';
import { ProductoService } from './producto.service';
import { Categoria, CategoriaService } from '../categoria';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-producto-dialog',
    templateUrl: './producto-dialog.component.html'
})
export class ProductoDialogComponent implements OnInit {

    producto: Producto;
    isSaving: boolean;

    categorias: Categoria[];

    constructor(
        public activeModal: NgbActiveModal,
        private alertService: JhiAlertService,
        private productoService: ProductoService,
        private categoriaService: CategoriaService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.categoriaService.query()
            .subscribe((res: ResponseWrapper) => { this.categorias = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.producto.id !== undefined) {
            this.subscribeToSaveResponse(
                this.productoService.update(this.producto));
        } else {
            this.subscribeToSaveResponse(
                this.productoService.create(this.producto));
        }
    }

    private subscribeToSaveResponse(result: Observable<Producto>) {
        result.subscribe((res: Producto) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: Producto) {
        this.eventManager.broadcast({ name: 'productoListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.alertService.error(error.message, null, null);
    }

    trackCategoriaById(index: number, item: Categoria) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-producto-popup',
    template: ''
})
export class ProductoPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private productoPopupService: ProductoPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.productoPopupService
                    .open(ProductoDialogComponent as Component, params['id']);
            } else {
                this.productoPopupService
                    .open(ProductoDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
