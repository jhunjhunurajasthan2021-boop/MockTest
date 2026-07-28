import { Document as DocxDocument, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, BorderStyle } from 'docx';

export async function generateSampleDocx(): Promise<Blob> {
  const tableData1 = [
    ['Question', 'The hybridization of the central carbon in CH3C≡N and the bond angle CCN are'],
    ['Type', 'multiple_choice'],
    ['Option', 'sp² , 180°'],
    ['Option', 'Sp , 180°'],
    ['Option', 'sp² , 120°'],
    ['Option', 'sp³ , 109°'],
    ['Option', 'sp³d , 90°'],
    ['Answer', '2'],
    ['Solution', 'Sp, 180°. The central carbon forms two sigma bonds, hence sp hybridized.'],
    ['Positive Marks', '4'],
    ['Negative Marks', '1'],
  ];

  const tableData2 = [
    ['Question', 'The HCF of x⁸ - 1 and x⁴ + 2x³ - 2x - 1 is:'],
    ['Type', 'multiple_choice'],
    ['Option', 'x - 1'],
    ['Option', 'x² - 1'],
    ['Option', 'x² + 1'],
    ['Option', 'x + 1'],
    ['Answer', '2'],
    ['Solution', 'x² - 1 is the highest common factor.'],
    ['Positive Marks', '4'],
    ['Negative Marks', '1'],
  ];

  const tableData3 = [
    ['Question', 'Which of the following numbers are prime numbers? (Multiple Choice)'],
    ['Type', 'mcq_multiple'],
    ['Option', '2'],
    ['Option', '3'],
    ['Option', '4'],
    ['Option', '5'],
    ['Option', '9'],
    ['Answer', '1, 2, 4'],
    ['Solution', '2, 3, and 5 are prime numbers.'],
    ['Positive Marks', '4'],
    ['Negative Marks', '1'],
  ];

  const makeTable = (data: string[][]) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: data.map(([label, value]) => {
        return new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, bold: true, size: 20 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: value, size: 20 })],
                }),
              ],
            }),
          ],
        });
      }),
    });
  };

  const doc = new DocxDocument({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'ONLINE TEST SERIES - QUESTION IMPORT SAMPLE TEMPLATE',
                bold: true,
                size: 28,
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Instructions for Teachers:\n',
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: '1. Create a separate table for each question as shown below.\n' +
                      '2. "Question": Put the question text or problem statement.\n' +
                      '3. "Type": multiple_choice or mcq_multiple or integer.\n' +
                      '4. "Option": Add 2, 3, 4, 5 or any number of option rows!\n' +
                      '5. "Answer": Index of correct option (1, 2, 3...) or multiple separated by comma (e.g. "1, 2").\n' +
                      '6. "Solution": Detailed explanation.\n' +
                      '7. "Positive Marks" / "Negative Marks": Marks for correct/incorrect responses.\n\n',
                size: 20,
              }),
            ],
          }),

          new Paragraph({
            children: [new TextRun({ text: 'Sample Question 1 (5 Options Chemistry Example)', bold: true, size: 22 })],
          }),
          makeTable(tableData1),

          new Paragraph({ text: '' }), // Spacer

          new Paragraph({
            children: [new TextRun({ text: 'Sample Question 2 (4 Options Math Example)', bold: true, size: 22 })],
          }),
          makeTable(tableData2),

          new Paragraph({ text: '' }), // Spacer

          new Paragraph({
            children: [new TextRun({ text: 'Sample Question 3 (Multiple Correct Answers)', bold: true, size: 22 })],
          }),
          makeTable(tableData3),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function downloadSampleDocxFile() {
  const blob = await generateSampleDocx();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Question_Import_Sample_Template.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
