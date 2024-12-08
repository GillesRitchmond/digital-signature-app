import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
// Retiré: import 'dotenv/config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nomPrenom, email, ipAddress } = body;

    const uniqueID = uuidv4();

    const currentDate = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // const signature = nomPrenom.split(" ").map((word: string) => word[0]).join(""); // Génère une signature à partir des initiales
    const signature = nomPrenom; // Utilise le nom complet comme signature
    console.log(currentDate);
    console.log(uniqueID, nomPrenom, email, ipAddress, signature, currentDate);

    const pdfPath = path.join(process.cwd(), "public", "Contrat.pdf");
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const idField = form.getTextField("ID");
    const signatureField = form.getTextField("signatureNomPrenom");
    const nomPrenomField = form.getTextField("NomPrenom");
    const ipField = form.getTextField("IPAddress");
    const dateField = form.getTextField("date");

    idField.setText(uniqueID);
    signatureField.setText(signature);
    nomPrenomField.setText(nomPrenom);
    ipField.setText(ipAddress);
    dateField.setText(currentDate);

    const modifiedPdfBytes = await pdfDoc.save({
      updateFieldAppearances: false,
    });
    const base64Pdf = Buffer.from(modifiedPdfBytes).toString("base64");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NEXT_EMAIL,
        pass: process.env.NEXT_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.NEXT_EMAIL,
      to: email,
      subject: "Votre document signé",
      text: "Veuillez trouver ci-joint votre document signé.",
      attachments: [
        {
          filename: "Contrat-signe.pdf",
          content: Buffer.from(modifiedPdfBytes),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Document signé et envoyé par email",
      pdfBase64: base64Pdf,
      ID: uniqueID,
    });
  } catch (error: any) {
    console.error("Erreur du serveur:", error);
    let errorMessage = "Erreur du serveur";
    if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as Error).message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
