import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { switchMap, tap, map } from 'rxjs/operators';

import { PaisesService } from '../../services/paises.service';
import { PaisSmall, Pais } from '../../interfaces/paises.interface';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [],
})
export class SelectorPageComponent implements OnInit {
  miFormulario: FormGroup = this.fb.group({
    region: ['', Validators.required],
    pais: ['', Validators.required],
    frontera: ['', Validators.required],
  });

  // llenar selectores
  regiones: string[] = [];
  paises: PaisSmall[] = [];
  fronteras: PaisSmall[] = [];

  // UI cargando
  cargando: boolean = false;

  otro!: Pais | null;

  constructor(private fb: FormBuilder, private paisesService: PaisesService) {}

  ngOnInit(): void {
    this.regiones = this.paisesService.regiones;

    // this.miFormulario.get('region')?.valueChanges.subscribe((region) => {
    //   console.log(region);
    //   this.paisesService.getPaisesPorRegion(region).subscribe((paises) => {
    //     console.log(paises);
    //     this.paises = paises.sort((a, b) =>
    //       a.name.common > b.name.common ? 1 : -1
    //     );
    //   });
    // });

    // cuando cambie la region
    // lo mismo que arriba pero con switchMap
    this.miFormulario
      .get('region')
      ?.valueChanges.pipe(
        tap((_) => {
          this.miFormulario.get('pais')?.reset('');
          this.cargando = true;
        }),
        switchMap((region) => this.paisesService.getPaisesPorRegion(region))
      )
      .subscribe((paises) => {
        this.paises = paises.sort((a, b) =>
          a.name.common > b.name.common ? 1 : -1
        );
        this.cargando = false;
      });

    // Cuando cambia el país
    this.miFormulario
      .get('pais')
      ?.valueChanges.pipe(
        tap(() => {
          this.miFormulario.get('frontera')?.reset('');
          this.cargando = true;
        }),
        switchMap((codigo) => this.paisesService.getPaisPorCode(codigo)),
        switchMap((paisArr) => {
          const borders = paisArr?.map((pais) => pais.borders)[0];
          return this.paisesService.getPaisesPorCodigos(borders!);
        })
      )
      .subscribe((borders) => {
        this.fronteras = borders;
        this.cargando = false;
      });
  }

  guardar() {
    console.log(this.miFormulario.value);
    console.log(this.fronteras);
  }
}
