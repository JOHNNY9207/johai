# Adding Business Knowledge

Open **Dashboard → AI Brain → Knowledge Center** and choose **Add source**.

## Supported now

- PDF, DOCX, XLSX, CSV, and TXT files up to 25 MB
- Manual text
- FAQ entries
- Product or service entries
- Policies
- Procedures

After upload, JOHAI validates and extracts the source. Check **Processing queue** for Ready, Failed, or Needs review status. Use **View** to inspect safe extracted text, **Reprocess** after a failure, **Archive** to remove a source from search, or **Delete** to remove it permanently.

The processing queue shows the attempt count, last attempt, duration, failure reason, and whether retry is available. Recoverable failures can be retried with a new request. A non-recoverable failure means the source must be corrected or replaced. JOHAI stops automatic retries after five attempts to avoid a loop.

## Replace an outdated document

Open **Documents**, choose an active Ready source, select **Replace version**, and then use **Replace current version** in the preview. Choose the updated file and upload it. JOHAI keeps the current Ready version searchable while it validates and extracts the replacement.

- A Ready replacement becomes the active version automatically.
- A Needs review replacement remains historical and inactive until you approve it from the preview.
- A failed replacement does not change the active source.
- **Version history** in the preview shows the active and historical files for that source.

Do not delete the current source before replacing it. When version history exists, JOHAI blocks deleting or archiving the active version so the lineage cannot be rolled back accidentally.

Archive and delete are also unavailable while a document is Processing. If a replacement fails, the previous Ready version remains active and searchable.

Search uses approved Ready documents. It currently uses keyword full-text search and displays that method honestly. If JOHAI cannot find a trusted answer, it should express uncertainty rather than inventing information.

Website URLs can be saved, but website crawling is planned and does not run yet.
