import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBlogguerComponent } from './dashboard-blogguer.component';

describe('DashboardBlogguerComponent', () => {
  let component: DashboardBlogguerComponent;
  let fixture: ComponentFixture<DashboardBlogguerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardBlogguerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardBlogguerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
