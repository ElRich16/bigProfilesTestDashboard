import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  providers: [DataService],
})
export class LayoutComponent implements OnInit {
  data: any = [];
  logs: any = [];
  dateRangeForm: FormGroup;
  constructor(private service: DataService, private fb: FormBuilder) {
    this.dateRangeForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.data = this.service.getDatas(
      new Date('2021-07-20T09:01:00'),
      new Date('2021-07-21T03:21:00')
    );
    console.log(this.data);
    this.logs = this.service.getDatas(
      new Date('2021-07-20T09:01:00'),
      new Date('2021-07-21T03:21:00')
    );
  }

  // Metodo per gestire il submit del form
  onSubmitDateRange(): void {
    const startDate = this.dateRangeForm.value.startDate;
    const endDate = this.dateRangeForm.value.endDate;

    // Aggiornare i dati dei grafici in base al range di date
    console.log('Data Inizio:', startDate);
    console.log('Data Fine:', endDate);

    // Puoi filtrare i dati qui e aggiornare i dataset dei grafici
    // Esempio di aggiornamento per il grafico a linee:
    // this.lineChartData = {
    //   ...this.lineChartData,
    //   datasets: [
    //     {
    //       ...this.lineChartData.datasets[0],
    //       data: [/* Dati filtrati in base al range */],
    //     },
    //   ],
    // };
  }
}
