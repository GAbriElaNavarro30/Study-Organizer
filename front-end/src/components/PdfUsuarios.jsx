import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/imagenes/logo-header.png";

export const PdfUsuarios = (usuarios) => {
  if (!usuarios || !usuarios.length) return;

  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const fechaActual = new Date().toLocaleString("es-MX");

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const img = new Image();
  img.src = logo;

  img.onload = () => {

    // ===== HEADER (SOLO PRIMERA PÁGINA) =====
    const drawHeader = () => {

      // Logo
      doc.addImage(img, "PNG", 15, 10, 70, 14);

      // Eslogan
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      doc.setTextColor(70, 90, 120); 
      doc.text(
        "Organiza tu estudio, cuida tu bienestar",
        pageWidth / 2,
        20,
        { align: "center" }
      );

      // Fecha
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Fecha: ${fechaActual}`,
        pageWidth - 15,
        18,
        { align: "right" }
      );

      // Línea elegante debajo
      doc.setDrawColor(120, 150, 190); 
      doc.setLineWidth(0.8);
      doc.line(15, 32, pageWidth - 15, 32);
    };

    // ===== FOOTER EN TODAS LAS PÁGINAS =====
    const drawFooter = (totalPages) => {

      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(15, pageHeight - 18, pageWidth - 15, pageHeight - 18);

      doc.setFontSize(8);
      doc.setTextColor(130);

      doc.text(
        `© ${new Date().getFullYear()} Study Organizer`,
        15,
        pageHeight - 10
      );

      doc.text(
        `Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${totalPages}`,
        pageWidth - 15,
        pageHeight - 10,
        { align: "right" }
      );
    };

    // Dibujar header SOLO aquí
    drawHeader();

    // ===== TÍTULO =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(50);
    doc.text("LISTA DE USUARIOS", pageWidth / 2, 45, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(110);
    doc.text(
      "Reporte general de usuarios registrados en el sistema",
      pageWidth / 2,
      52,
      { align: "center" }
    );

    // ===== TABLA =====
    autoTable(doc, {
      startY: 60,
      margin: { left: 15, right: 15 },
      theme: "grid",
      head: [[
        "ID",
        "Nombre",
        "Correo",
        "Rol",
        "Teléfono",
        "Género",
        "Nacimiento"
      ]],
      body: usuarios.map(u => [
        u.id,
        u.nombre_usuario,
        u.correo,
        u.rol,
        u.telefono || "-",
        u.genero || "-",
        formatFecha(u.fecha_nacimiento)
      ]),
      styles: {
        fontSize: 11,
        cellPadding: 4,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255], // blanco en todas las celdas
        lineColor: [210, 210, 210], // líneas gris claro
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [68, 120, 189], // azul clarito
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center"
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      columnStyles: {
        0: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" }
      },
      didDrawPage: () => {
        const totalPages = doc.getNumberOfPages();
        drawFooter(totalPages);
      }
    });


    doc.save(`Reporte_Usuarios_${new Date().toLocaleDateString("es-MX")}.pdf`);
  };
};
