import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { DataService } from '../../../services/data.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AggregatedValue,
  KeyDistribution,
  Log,
  PageModel,
  TimeDistribution,
  ValueResponse,
} from '../../../models/models';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  providers: [DataService],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  data$: BehaviorSubject<PageModel> = new BehaviorSubject<PageModel>({
    averageResponseTime: 0,
    totalRequests: 0,
    ketyDistribution: {},
    timeDistribution: {},
    logs: [],
    totalErrors: 0,
  });
  logs: Log[] = [];
  formSubmitted: boolean = false;
  totalErrors: number = 0;
  keyDistributionChart: Chart | null = null;
  timeLineChart: Chart | null = null;
  constructor(private service: DataService, private cdr: ChangeDetectorRef) {}
  ngAfterViewInit(): void {
    this.createKeyDistributionChart();
    this.createChartPie();
    //() this.createTimeLineChart();
  }

  ngOnInit(): void {}

  changeDateRange(from: HTMLInputElement, to: HTMLInputElement): void {
    console.log(from.value, to.value);
    if (!from.value || !to.value) return;
    // TODO validators and control for from and to not null not string empty
    // after transform in date weith new see cosnole.log  console.log(new Date(from.value), to.value);
    this.fetchData(new Date(from.value), new Date(to.value));
    // const startDate = new Date(this.dateRangeForm.value.startDate);
    // const endDate = new Date(this.dateRangeForm.value.endDate);
    // if (startDate && endDate && startDate <= endDate) {
    //   this.fetchData(startDate, endDate);
    //   this.formSubmitted = true;
    // } else {
    //   console.error('Le date selezionate non sono valide.');
    // }
  }

  // Method for call API
  fetchData(startDate: Date, endDate: Date): void {
    this.service
      .getDatas(startDate, endDate)
      .pipe(map((r) => this.computePage(r)))
      .subscribe({
        next: (model: PageModel) => {
          this.data$.next(model);
          this.cdr.detectChanges();
          console.log('Dati aggiornati:', model);

          this.createKeyDistributionChart();
          this.createChartPie();
          this.createTimeLineChart(startDate, endDate);
        },
        error: (error: any) => {
          console.error('Errore durante la chiamata all’API:', error);
        },
        complete: () => {
          console.log('Chiamata API completata.');
        },
      });
  }

  computePage(resp: ValueResponse): PageModel {
    const totalRequests = resp.values.reduce(
      (acc: number, curr: AggregatedValue) => acc + curr.total_requests,
      0
    );
    return {
      logs: resp.logs,
      totalErrors: resp.values.reduce(
        (acc: number, curr: AggregatedValue) => acc + curr.total_errors,
        0
      ),
      totalRequests: totalRequests,
      averageResponseTime:
        resp.values.reduce(
          (acc: number, curr: AggregatedValue) =>
            acc + curr.total_response_time_ms,
          0
        ) / totalRequests,
      timeDistribution: resp.values.reduce(
        (acc: TimeDistribution, curr: AggregatedValue) => {
          const key = curr.creation_datetime;
          acc[key] = (acc[key] || 0) + curr.total_requests;
          return acc;
        },
        {}
      ),
      ketyDistribution: resp.values.reduce(
        (acc: KeyDistribution, curr: AggregatedValue) => {
          acc[curr.key] = (acc[curr.key] || 0) + curr.total_requests;
          return acc;
        },
        {}
      ),
    };
  }

  barChartLabels: string[] = ['1', '2', '3', '4', '5', '6'];

  barChartData = [
    {
      data: this.data$.subscribe((res) => {
        console.log('key distribu', res.ketyDistribution);
      }),
      label: 'Numero di chiamate',
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ];

  // chart options
  barChartOptions = {
    responsive: true,
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  barChartType: any = 'bar';
  // method for create graphic for key distribution in call
  createKeyDistributionChart(): void {
    const ketyDistributionCanvas = document.getElementById(
      'myChart'
    ) as HTMLCanvasElement;

    const labels = Object.keys(this.data$.value.ketyDistribution);
    const values = Object.values(this.data$.value.ketyDistribution);

    if (this.keyDistributionChart) {
      this.keyDistributionChart.destroy(); // destroy
    }

    this.keyDistributionChart = new Chart(ketyDistributionCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Numero di chiamate',
            data: values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
  // pie for errors
  createChartPie(): void {
    const pieErrorCanvas = document.getElementById(
      'myPieChart'
    ) as HTMLCanvasElement;

    // Calcola la percentuale degli errori
    const totalErrors = this.data$.value.totalErrors;
    const totalRequests = this.data$.value.totalRequests;
    const successfulRequests = totalRequests - totalErrors;

    if (totalRequests === 0) {
      console.warn('Non ci sono chiamate totali. Grafico non creato.');
      return; // Evita di creare il grafico se non ci sono dati
    }

    const errorPercentage = (totalErrors / totalRequests) * 100;
    const successPercentage = (successfulRequests / totalRequests) * 100;

    if (this.keyDistributionChart) {
      this.keyDistributionChart.destroy();
    }

    new Chart(pieErrorCanvas, {
      type: 'pie',
      data: {
        labels: ['Errori', 'Successi'], // Etichette per il grafico
        datasets: [
          {
            label: 'Percentuale di errori vs successi',
            data: [errorPercentage, successPercentage], // Dati
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)', // Colore per gli errori
              'rgba(54, 162, 235, 0.6)', // Colore per i successi
            ],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true, // Adatta il grafico alla dimensione della finestra
        plugins: {
          legend: {
            display: true, // Mostra la legenda
            position: 'top', // Posizione della legenda
          },
          tooltip: {
            enabled: true, // Tooltip al passaggio del mouse
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw as number;
                return `${label}: ${value.toFixed(2)}%`; // Mostra la percentuale con due decimali
              },
            },
          },
        },
      },
    });
  }

  createTimeLineChart(startDate: Date, endDate: Date): void {
    const timeLine = document.getElementById(
      'myLineChart'
    ) as HTMLCanvasElement;

    if (this.timeLineChart) {
      this.timeLineChart.destroy(); // Distruggi il grafico esistente se necessario
    }

    // Genera le date tra startDate e endDate
    const labels = this.generateDateLabels(startDate, endDate);

    // Sostituisci con dati reali, se disponibili
    const dataValues = labels.map(() => Math.floor(Math.random() * 50)); // Dati simulati

    this.timeLineChart = new Chart(timeLine, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Chiamate nel tempo',
            data: dataValues,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: `Timeline: ${startDate.toISOString()} - ${endDate.toISOString()}`,
              color: '#007bff',
              font: {
                size: 14,
                weight: 'bold',
              },
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Conteggio',
              color: '#007bff',
              font: {
                size: 14,
                weight: 'bold',
              },
            },
          },
        },
      },
    });
  }

  generateDateLabels(startDate: Date, endDate: Date): string[] {
    const labels: string[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      labels.push(currentDate.toISOString().slice(0, 16).replace('T', ' ')); // Formatta la data
      currentDate.setHours(currentDate.getHours() + 1); // Incrementa di 1 ora
    }

    return labels;
  }
}
