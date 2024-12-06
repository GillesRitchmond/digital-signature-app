# digital-signature-app
Electronic signature application enabling users to display a document, enter their first name, last name and email address, then receive a double authentication code before signing. The signature includes the signatory's name, date of signature and IP address, with the option of keeping a history.

# Digital Signature App

Welcome to the Digital Signature App! This platform allows you to securely sign documents online, using a two-step authentication process to ensure authenticity and data integrity.

## Features

- **Document Preview**: Display a PDF document in a modal popup for easy review before signing.
- **Signature Form**: Users can enter their first and last names, as well as their email address, before proceeding.
- **Two-Factor Authentication (2FA)**: A unique 6-character alphanumeric code is sent to the provided email address, ensuring secure verification.
- **Verified Signing**: Once the code is confirmed, the user’s name, current date, and IP address are recorded as part of the signature.
- **IP Logging**: The user’s IP address is logged in the console for verification and auditing.
- **Signed Document Download**: Optionally, users can download the signed document for their records.
- **Extendability**: Easily integrate advanced features such as database storage, notifications, version management, or third-party signing services (e.g., DocuSign).

## Technologies Used

- **Next.js (App Directory)**: Modern architecture for optimal performance.
- **React**: Modular and reactive components to deliver a smooth user experience.
- **TypeScript (Optional)**: Strong typing for enhanced code reliability and maintainability.
- **Node mailer (Email Services)**: Automated sending of authentication codes.
- **Database (MongoDB)**: For storing signature records and user data (optional depending on implementation).
- **UI Frameworks (Tailwind CSS)**: For a clean, minimalistic, and user-friendly interface.

