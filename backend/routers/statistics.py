from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import distinct

from collections import defaultdict, Counter
from io import BytesIO
import datetime

from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, PageBreak
)
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors

from database import get_db
from models import Reservation, User, Room

from fastapi import Query
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


router = APIRouter(
    prefix="/api/report",
    tags=["report"]
)






@router.get("/usage-stats-pdf")
def export_usage_stats_pdf(db: Session = Depends(get_db)):
    try:
        reservations = db.query(Reservation).options(
            joinedload(Reservation.user),
            joinedload(Reservation.room)
        ).all()

        # Parametry slotów (np. godziny, długość slotu)
        time_slots = ["08:00", "09:45", "11:30", "13:15", "15:00", "16:45", "18:30"]
        slot_duration = 1.5  # godziny
        total_slots = len(time_slots)
        max_day_hours = total_slots * slot_duration

        # Grupowanie po (YYYY-MM, room_name)
        grouped = defaultdict(list)
        for r in reservations:
            if not (r.date and r.room and r.time_from and r.time_to):
                continue
            month_key = r.date.strftime("%Y-%m")
            grouped[(month_key, r.room.name)].append(r)

        styles = getSampleStyleSheet()
        title_style = styles["Heading2"]

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=landscape(A4),
            rightMargin=1 * cm, leftMargin=1 * cm,
            topMargin=1 * cm, bottomMargin=1 * cm
        )
        elements = []

        months = sorted(set(k[0] for k in grouped.keys()))
        for month in months:
            elements.append(Paragraph(f"<b>STATYSTYKI REZERWACJI - {month}</b>", title_style))
            elements.append(Spacer(1, 10))

            data = [["Sala", "Liczba rezerwacji", "Lacznie godzin", "Maks. godzin", "Wykorzystanie (%)", "Najczestszy rezerwujacy (% udzialu)"]]

            for room_name in sorted(set(k[1] for k in grouped if k[0] == month)):
                res_list = grouped[(month, room_name)]

                res_count = len(res_list)
                total_hours = sum(
                    (datetime.datetime.combine(datetime.date.min, r.time_to) -
                     datetime.datetime.combine(datetime.date.min, r.time_from)).seconds / 3600
                    for r in res_list
                )

                # Liczba unikalnych dni z rezerwacjami dla sali w miesiącu
                days = set(r.date for r in res_list)
                max_hours = len(days) * max_day_hours
                percent = round((total_hours / max_hours) * 100, 1) if max_hours > 0 else 0.0

                # Liczenie użytkowników
                user_counter = Counter()
                for r in res_list:
                    if r.user:
                        user_key = f"{r.user.first_name[0]}.{r.user.last_name}" if r.user.first_name and r.user.last_name else r.user.email
                        user_counter[user_key] += 1

                if user_counter:
                    top_user, top_count = user_counter.most_common(1)[0]
                    top_percent = round((top_count / res_count) * 100, 1)
                    top_user_str = f"{top_user} ({top_percent} %)"
                else:
                    top_user_str = "-"

                data.append([
                    room_name,
                    str(res_count),
                    f"{total_hours:.1f}",
                    f"{max_hours:.1f}",
                    f"{percent:.1f} %",
                    top_user_str
                ])

            table = Table(data, colWidths=[5 * cm, 3.5 * cm, 3.5 * cm, 3.5 * cm, 4 * cm, 6 * cm])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#cccccc")),
                ('GRID', (0, 0), (-1, -1), 0.3, colors.black),
                ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
            ]))
            elements.append(table)
            elements.append(PageBreak())

        doc.build(elements)
        buffer.seek(0)

        return Response(
            content=buffer.read(),
            media_type='application/pdf',
            headers={"Content-Disposition": "attachment; filename=statystyki_rezerwacji.pdf"}
        )

    except Exception as e:
        import traceback
        print("Błąd podczas generowania PDF:\n", traceback.format_exc())
        return Response(content="Internal Server Error", status_code=500)


















@router.get("/pdf-schedule")
def export_schedule_pdf(db: Session = Depends(get_db)):
    try:
        time_slots = ["08:00", "09:45", "11:30", "13:15", "15:00", "16:45", "18:30"]

        rooms = db.query(Room).order_by(Room.name).all()
        dates = db.query(distinct(Reservation.date)).order_by(Reservation.date).all()
        dates = [d[0] for d in dates if d[0] is not None]

        reservations = db.query(Reservation).options(joinedload(Reservation.user)).all()

        styles = getSampleStyleSheet()
        normal_style = ParagraphStyle(name='Center', parent=styles['Normal'], alignment=1, fontSize=8)

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            rightMargin=1 * cm,
            leftMargin=1 * cm,
            topMargin=1 * cm,
            bottomMargin=1 * cm
        )

        elements = []

        for i, day in enumerate(dates):
            day_str = day.strftime("%A %d.%m.%Y").capitalize()
            elements.append(Paragraph(f"<b>DAY: {day_str}</b>", styles["Heading2"]))
            elements.append(Spacer(1, 6))

            header_row = ["SALA"] + time_slots
            data = [header_row]

            for room in rooms:
                row = [room.name]
                for slot_str in time_slots:
                    slot_start = datetime.datetime.strptime(slot_str, "%H:%M").time()
                    slot_end = (datetime.datetime.combine(datetime.date.today(), slot_start) + datetime.timedelta(minutes=90)).time()

                    r = next((
                        res for res in reservations
                        if res.date == day and res.room_id == room.id and res.time_from and res.time_to
                        and res.time_from < slot_end and res.time_to > slot_start
                    ), None)

                    if r and r.user and r.user.first_name and r.user.last_name:
                        first_initial = r.user.first_name[0] if r.user.first_name else ""
                        val = f"{first_initial}.{r.user.last_name}"
                    else:
                        val = ""

                    row.append(Paragraph(val, normal_style))
                data.append(row)

            col_widths = [3 * cm] + [2.5 * cm for _ in time_slots]

            table = Table(data, colWidths=col_widths, repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#d3d3d3")),
                ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
                ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ]))

            elements.append(table)

            if i < len(dates) - 1:
                elements.append(PageBreak())
            else:
                elements.append(Spacer(1, 12))

        doc.build(elements)
        buffer.seek(0)

        return Response(
            content=buffer.read(),
            media_type='application/pdf',
            headers={"Content-Disposition": "attachment; filename=harmonogram.pdf"}
        )

    except Exception as e:
        import traceback
        print("Błąd podczas generowania PDF:\n", traceback.format_exc())
        return Response(content="Internal Server Error", status_code=500)


































@router.get("/xlsx")
def export_all_reservations(db: Session = Depends(get_db)):
    try:
        time_slots = [
            "08:00", "09:45", "11:30", "13:15", "15:00", "16:45", "18:30",
        ]

        rooms = db.query(Room).all()
        dates = db.query(distinct(Reservation.date)).order_by(Reservation.date).all()
        dates = [d[0] for d in dates if d[0] is not None]
        reservations = db.query(Reservation).options(joinedload(Reservation.user)).all()

        wb = Workbook()
        ws = wb.active
        ws.title = "Harmonogram"

        row_idx = 1

        for day in dates:
            day_str = day.strftime("%A %d.%B").capitalize()

            # Dzień - scalona komórka
            ws.merge_cells(start_row=row_idx, start_column=1, end_row=row_idx, end_column=2 + len(time_slots))
            ws.cell(row=row_idx, column=1, value=f"DZIEŃ: {day_str}")
            ws.cell(row=row_idx, column=1).font = Font(bold=True)
            row_idx += 1

            # Godziny
            ws.cell(row=row_idx, column=1, value="SALA").font = Font(bold=True)
            for i, slot in enumerate(time_slots):
                ws.cell(row=row_idx, column=i + 2, value=slot).font = Font(bold=True)
            row_idx += 1

            for room in rooms:
                ws.cell(row=row_idx, column=1, value=room.name)

                for i, slot_start_str in enumerate(time_slots):
                    slot_start = datetime.datetime.strptime(slot_start_str, "%H:%M").time()
                    slot_end = (datetime.datetime.combine(datetime.date.today(), slot_start) + datetime.timedelta(minutes=90)).time()

                    reservation = next((
                        r for r in reservations
                        if r.date == day and r.room_id == room.id
                        and r.time_from and r.time_to
                        and r.time_from < slot_end and r.time_to > slot_start
                    ), None)

                    if reservation and reservation.user and reservation.user.first_name and reservation.user.last_name:
                        user_info = f"{reservation.user.first_name[0]}.{reservation.user.last_name}"
                    else:
                        user_info = ""

                    cell = ws.cell(row=row_idx, column=i + 2, value=user_info)
                    cell.alignment = Alignment(horizontal="center")

                row_idx += 1

            row_idx += 2

        # Auto-szerokość (z poprawką na MergedCell)
        for i, col in enumerate(ws.columns, start=1):
            max_length = max(len(str(cell.value or "")) for cell in col)
            col_letter = get_column_letter(i)
            ws.column_dimensions[col_letter].width = max_length + 2

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        headers = {
            "Content-Disposition": "attachment; filename=harmonogram_formatowany.xlsx"
        }

        return Response(
            content=output.read(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers
        )

    except Exception as e:
        import traceback
        print("Błąd eksportu XLSX:", e)
        traceback.print_exc()
        return Response(content=f"Błąd eksportu XLSX: {e}", status_code=500)




@router.get("/pdf-room-schedule")
def export_room_schedule_pdf(
    room_id: int = Query(..., description="ID sali"),
    db: Session = Depends(get_db)
):
    try:
        time_slots = ["08:00", "09:45", "11:30", "13:15", "15:00", "16:45", "18:30"]

        room = db.query(Room).filter(Room.id == room_id).first()
        if not room:
            return Response(content="Sala nie istnieje", status_code=404)

        dates = db.query(distinct(Reservation.date))\
            .join(Reservation.room)\
            .filter(Reservation.room_id == room_id)\
            .order_by(Reservation.date)\
            .all()
        dates = [d[0] for d in dates if d[0] is not None]

        reservations = db.query(Reservation).options(joinedload(Reservation.user))\
            .filter(Reservation.room_id == room_id)\
            .all()

        styles = getSampleStyleSheet()
        normal_style = ParagraphStyle(name='Center', parent=styles['Normal'], alignment=1, fontSize=9)

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=landscape(A4),
            rightMargin=1 * cm, leftMargin=1 * cm,
            topMargin=1 * cm, bottomMargin=1 * cm
        )

        elements = []

        elements.append(Paragraph(f"<b>Harmonogram sali: {room.name}</b>", styles["Heading2"]))
        elements.append(Spacer(1, 12))

        data = [["DATA"] + time_slots]

        for day in dates:
            row = [day.strftime("%A %d.%m.%Y").capitalize()]
            for slot_str in time_slots:
                slot_start = datetime.datetime.strptime(slot_str, "%H:%M").time()
                slot_end = (datetime.datetime.combine(datetime.date.today(), slot_start) + datetime.timedelta(minutes=90)).time()

                r = next((res for res in reservations
                          if res.date == day and res.time_from and res.time_to
                          and res.time_from < slot_end and res.time_to > slot_start), None)

                if r and r.user:
                    val = f"{r.user.first_name[0]}.{r.user.last_name}" if r.user.first_name and r.user.last_name else r.user.email
                else:
                    val = ""
                row.append(Paragraph(val, normal_style))
            data.append(row)

        table = Table(data, colWidths=[4.5 * cm] + [2.8 * cm] * len(time_slots), repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#d3d3d3")),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
        ]))

        elements.append(table)

        doc.build(elements)
        buffer.seek(0)

        return Response(
            content=buffer.read(),
            media_type='application/pdf',
            headers={"Content-Disposition": f"attachment; filename=harmonogram_sala_{room.name}.pdf"}
        )

    except Exception as e:
        import traceback
        print("Błąd generowania PDF (sala):\n", traceback.format_exc())
        return Response(content="Internal Server Error", status_code=500)