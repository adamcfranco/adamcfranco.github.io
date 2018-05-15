importScripts('../libraries/pdfmake.min.js', '../libraries/vfs_fonts.js');
this.onmessage = (e) =>
{
	if (e.data.generatePDFAsync !== undefined)
	{
		let generatedPDFFile = pdfMake.createPdf(e.data.generatePDFAsync.def).getBuffer((buffer) =>
		{
			blob = new Blob([buffer]);
			this.postMessage(blob);
		});
	}
};