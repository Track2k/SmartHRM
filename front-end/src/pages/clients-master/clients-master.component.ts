import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ClientsService } from './client.service';
import { ClientWithContacts } from './client.model';
import { ClientFormComponent } from '../client-form/client-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-clients-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ClientFormComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './clients-master.component.html',
  styleUrls: ['./clients-master.component.css'],
})
export class ClientsMasterComponent implements OnInit {
  clients: ClientWithContacts[] = [];
  searchQuery: string = '';
  dataSource = new MatTableDataSource<ClientWithContacts>(); // Define the dataSource

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private clientsService: ClientsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientsService.getClients().subscribe(
      (clients: ClientWithContacts[]) => {
        this.clients = clients;
        this.dataSource.data = clients; // Set the data for the dataSource
      },
      (error) => {
        this.snackBar.open('Failed to load clients. Please try again.', 'Close', { duration: 3000 });
        console.error('Failed to load clients:', error);
      }
    );
  }

  openAddClientForm(): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      height: '600px',
      width: '700px',
      data: {
        cl_name: '',
        cl_email: '',
        cl_co_per_name: '',
        cl_phno: '',
        cl_addr: '',
        cl_map_url: '',
        cl_type: '',
        cl_notes: '',
        cl_si_ag: '',
        contacts: [{
          co_name: '',
          co_position_hr: '',
          co_email: '',
          co_phno: ''
        }],
        formType: 'add'
      },
    });

    dialogRef.afterClosed().subscribe((result: ClientWithContacts | undefined) => {
      if (result) {
        this.clientsService.createClient(result).subscribe(
          () => {
            this.loadClients();
            this.snackBar.open('Client created successfully!', 'Close', { duration: 3000 });
          },
          (error: unknown) => {
            this.snackBar.open('Failed to create client. Please try again.', 'Close', { duration: 3000 });
            console.error('Failed to create client:', error);
          }
        );
      }
    });
  }

  openEditClientForm(client: ClientWithContacts): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      height: '600px',
      width: '700px',
      data: {
        ...client,
        formType: 'update'
      },
    });

    dialogRef.afterClosed().subscribe((result: ClientWithContacts | undefined) => {
      if (result && result.cl_id) {
        this.clientsService.updateClient(result.cl_id, result).subscribe(
          () => {
            this.loadClients();
            this.snackBar.open('Client updated successfully!', 'Close', { duration: 3000 });
          },
          (error) => {
            this.snackBar.open('Failed to update client. Please try again.', 'Close', { duration: 3000 });
            console.error('Failed to update client:', error);
          }
        );
      }
    });
  }

  openViewClientForm(client: ClientWithContacts): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      height: '600px',
      width: '700px',
      data: {
        ...client,
        formType: 'view'
      },
    });

    dialogRef.afterClosed().subscribe(); // No need to handle result for view
  }

  deleteClient(client: ClientWithContacts): void {
    if (client.cl_id) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.clientsService.deleteClient(client.cl_id!).subscribe(
            () => {
              this.loadClients();
              this.snackBar.open('Client deleted successfully!', 'Close', { duration: 3000 });
            },
            (error) => {
              this.snackBar.open('Failed to delete client. Please try again.', 'Close', { duration: 3000 });
              console.error('Failed to delete client:', error);
            }
          );
        } else {
          console.log('Client deletion was cancelled.');
        }
      });
    } else {
      console.error('Client ID is undefined, cannot delete client.');
    }
  }

  filterClients(): ClientWithContacts[] {
    return this.clients.filter(client =>
      client.cl_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (client.cl_email && client.cl_email.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (client.cl_addr && client.cl_addr.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (client.contacts && client.contacts.length > 0 &&
        client.contacts[0].co_name.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }
}
