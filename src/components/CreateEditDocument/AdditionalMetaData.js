import Select from '../Select';
import styles from './CreateEditDocument.module.scss';

const rows = (arr) => arr.map((row) => (
  <div style={{ display: 'flex', flexDireciton: 'row' }}>
    {row}
  </div>
));

const column = ({ header, content }) => (
  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
    <div className={styles.additionalMetadataHeaders}>{header}</div>
    {content}
  </div>
);

const additionalMetadataObj = ({
  publicationTitle,
  setPublicationTitle,
  publicationDate,
  setPublicationDate,
  publisher,
  setPublisher,
  publisherLocation,
  setPublisherLocation,
  rightsStatus,
  setRightsStatus,
  volume,
  setVolume,
  edition,
  setEdition,
  issue,
  setIssue,
  series,
  setSeries,
  seriesNumber,
  setSeriesNumber,
  url,
  setUrl,
  dateAccessed,
  setDateAccessed,
  pages,
  setPages,
  websiteTitle,
  setWebsiteTitle,
  newspaperTitle,
  setNewspaperTitle,
  magazineTitle,
  setMagazineTitle,
  journalTitle,
  setJournalTitle,
  bookTitle,
  setBookTitle,
}) => ({
  Book: {
    text: 'Book',
    additionalMetadataHeight: 490,
    html: rows([
      [
        column({
          header: 'Publication Date',
          content: <input
            placeholder="Date"
            value={publicationDate}
            onChange={(ev) => setPublicationDate(ev.target.value)}
          />,
        }),
        column({
          header: 'Publisher',
          content: <input
            placeholder="Publisher"
            value={publisher}
            onChange={(ev) => setPublisher(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Location',
          content: <input
            placeholder="Location"
            value={publisherLocation}
            onChange={(ev) => setPublisherLocation(ev.target.value)}
          />,
        }),
        column({
          header: 'Rights Status',
          content: <Select
            options={[
              { text: 'Copyrighted', key: 'Copyrighted' },
              { text: 'Creative Commons', key: 'Creative Commons' },
              { text: 'Public Domain', key: 'Public Domain' },
            ]}
            selectedOptionKey={rightsStatus}
            setSelectedOptionKey={setRightsStatus}
          />,
        }),
      ],
      [
        column({
          header: 'Volume',
          content: <input
            placeholder="Volume"
            value={volume}
            onChange={(ev) => setVolume(ev.target.value)}
          />,
        }),
        column({
          header: 'Edition',
          content: <input
            placeholder="Edition"
            value={edition}
            onChange={(ev) => setEdition(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Series',
          content: <input
            placeholder="Series"
            value={series}
            onChange={(ev) => setSeries(ev.target.value)}
          />,
        }),
        column({
          header: 'Number in series',
          content: <input
            placeholder="Number"
            value={seriesNumber}
            onChange={(ev) => setSeriesNumber(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'URL',
          content: <input
            placeholder="URL"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
          />,
        }),
        column({
          header: 'Date Accessed',
          content: <input
            placeholder="Date"
            value={dateAccessed}
            onChange={(ev) => setDateAccessed(ev.target.value)}
          />,
        }),
      ],
    ]),
  },
  'Book Section': {
    text: 'Book Section',
    additionalMetadataHeight: 665,
    html: rows([
      [
        column({
          header: 'Book Title',
          content: <input
            placeholder="Book Title"
            value={bookTitle}
            onChange={(ev) => setBookTitle(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Date',
          content: <input
            placeholder="Date"
            value={publicationDate}
            onChange={(ev) => setPublicationDate(ev.target.value)}
          />,
        }),
        column({
          header: 'Publisher',
          content: <input
            placeholder="Publisher"
            value={publisher}
            onChange={(ev) => setPublisher(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Location',
          content: <input
            placeholder="Location"
            value={publisherLocation}
            onChange={(ev) => setPublisherLocation(ev.target.value)}
          />,
        }),
        column({
          header: 'Rights Status',
          content: <Select
            options={[
              { text: 'Copyrighted', key: 'Copyrighted' },
              { text: 'Creative Commons', key: 'Creative Commons' },
              { text: 'Public Domain', key: 'Public Domain' },
            ]}
            selectedOptionKey={rightsStatus}
            setSelectedOptionKey={setRightsStatus}
          />,
        }),
      ],
      [
        column({
          header: 'Volume',
          content: <input
            placeholder="Volume"
            value={volume}
            onChange={(ev) => setVolume(ev.target.value)}
          />,
        }),
        column({
          header: 'Edition',
          content: <input
            placeholder="edition"
            value={edition}
            onChange={(ev) => setEdition(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Pages',
          content: <input
            placeholder="Pages (e.g. 1-10)"
            value={pages}
            onChange={(ev) => setPages(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Series',
          content: <input
            placeholder="Series"
            value={series}
            onChange={(ev) => setSeries(ev.target.value)}
          />,
        }),
        column({
          header: 'Number in series',
          content: <input
            placeholder="number in series"
            value={seriesNumber}
            onChange={(ev) => setSeriesNumber(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'URL',
          content: <input
            placeholder="URL"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
          />,
        }),
        column({
          header: 'Date Accessed',
          content: <input
            placeholder="Date"
            value={dateAccessed}
            onChange={(ev) => setDateAccessed(ev.target.value)}
          />,
        }),
      ],
    ]),
  },
  'Journal Article': {
    text: 'Journal Article',
    additionalMetadataHeight: 577,
    html: rows([
      [
        column({
          header: 'Journal Title',
          content: <input
            placeholder="Journal Title"
            value={journalTitle}
            onChange={(ev) => setJournalTitle(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Date',
          content: <input
            placeholder="Date"
            value={publicationDate}
            onChange={(ev) => setPublicationDate(ev.target.value)}
          />,
        }),
        column({
          header: 'Publisher',
          content: <input
            placeholder="Publisher"
            value={publisher}
            onChange={(ev) => setPublisher(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Location',
          content: <input
            placeholder="Location"
            value={publisherLocation}
            onChange={(ev) => setPublisherLocation(ev.target.value)}
          />,
        }),
        column({
          header: 'Rights Status',
          content: <Select
            options={[
              { text: 'Copyrighted', key: 'Copyrighted' },
              { text: 'Creative Commons', key: 'Creative Commons' },
              { text: 'Public Domain', key: 'Public Domain' },
            ]}
            selectedOptionKey={rightsStatus}
            setSelectedOptionKey={setRightsStatus}
          />,
        }),
      ],
      [
        column({
          header: 'Volume',
          content: <input
            placeholder="Volume"
            value={volume}
            onChange={(ev) => setVolume(ev.target.value)}
          />,
        }),
        column({
          header: 'Issue',
          content: <input
            placeholder="Issue"
            value={issue}
            onChange={(ev) => setIssue(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Pages',
          content: <input
            placeholder="Pages (e.g. 1-10)"
            value={pages}
            onChange={(ev) => setPages(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'URL',
          content: <input
            placeholder="URL"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
          />,
        }),
        column({
          header: 'Date Accessed',
          content: <input
            placeholder="Date"
            value={dateAccessed}
            onChange={(ev) => setDateAccessed(ev.target.value)}
          />,
        }),
      ],
    ]),
  },
  'Magazine Article': {
    text: 'Magazine Article',
    additionalMetadataHeight: 577,
    html: rows([
      [
        column({
          header: 'Magazine Title',
          content: <input
            placeholder="Magazine Title"
            value={magazineTitle}
            onChange={(ev) => setMagazineTitle(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Date',
          content: <input
            placeholder="Date"
            value={publicationDate}
            onChange={(ev) => setPublicationDate(ev.target.value)}
          />,
        }),
        column({
          header: 'Publisher',
          content: <input
            placeholder="Publisher"
            value={publisher}
            onChange={(ev) => setPublisher(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Location',
          content: <input
            placeholder="Location"
            value={publisherLocation}
            onChange={(ev) => setPublisherLocation(ev.target.value)}
          />,
        }),
        column({
          header: 'Rights Status',
          content: <Select
            options={[
              { text: 'Copyrighted', key: 'Copyrighted' },
              { text: 'Creative Commons', key: 'Creative Commons' },
              { text: 'Public Domain', key: 'Public Domain' },
            ]}
            selectedOptionKey={rightsStatus}
            setSelectedOptionKey={setRightsStatus}
          />,
        }),
      ],
      [
        column({
          header: 'Volume',
          content: <input
            placeholder="Volume"
            value={volume}
            onChange={(ev) => setVolume(ev.target.value)}
          />,
        }),
        column({
          header: 'Issue',
          content: <input
            placeholder="Issue"
            value={issue}
            onChange={(ev) => setIssue(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Pages',
          content: <input
            placeholder="Pages (e.g. 1-10)"
            value={pages}
            onChange={(ev) => setPages(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'URL',
          content: <input
            placeholder="URL"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
          />,
        }),
        column({
          header: 'Date Accessed',
          content: <input
            placeholder="Date"
            value={dateAccessed}
            onChange={(ev) => setDateAccessed(ev.target.value)}
          />,
        }),
      ],
    ]),
  },
  'Newspaper Article': {
    text: 'Newspaper Article',
    additionalMetadataHeight: 490,
    html: rows([
      [
        column({
          header: 'Newspaper Title',
          content: <input
            placeholder="Newspaper Title"
            value={newspaperTitle}
            onChange={(ev) => setNewspaperTitle(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Date',
          content: <input
            placeholder="Date"
            value={publicationDate}
            onChange={(ev) => setPublicationDate(ev.target.value)}
          />,
        }),
        column({
          header: 'Publisher',
          content: <input
            placeholder="Publisher"
            value={publisher}
            onChange={(ev) => setPublisher(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Location',
          content: <input
            placeholder="Location"
            value={publisherLocation}
            onChange={(ev) => setPublisherLocation(ev.target.value)}
          />,
        }),
        column({
          header: 'Rights Status',
          content: <Select
            options={[
              { text: 'Copyrighted', key: 'Copyrighted' },
              { text: 'Creative Commons', key: 'Creative Commons' },
              { text: 'Public Domain', key: 'Public Domain' },
            ]}
            selectedOptionKey={rightsStatus}
            setSelectedOptionKey={setRightsStatus}
          />,
        }),
      ],
      [
        column({
          header: 'Pages',
          content: <input
            placeholder="Pages (e.g. 1-10)"
            value={pages}
            onChange={(ev) => setPages(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'URL',
          content: <input
            placeholder="URL"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
          />,
        }),
        column({
          header: 'Date Accessed',
          content: <input
            placeholder="Date"
            value={dateAccessed}
            onChange={(ev) => setDateAccessed(ev.target.value)}
          />,
        }),
      ],
    ]),
  },
  'Web Page': {
    text: 'Web Page',
    additionalMetadataHeight: 403,
    html: rows([
      [
        column({
          header: 'Website Title',
          content: <input
            placeholder="Website Title"
            value={websiteTitle}
            onChange={(ev) => setWebsiteTitle(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Date',
          content: <input
            placeholder="Date"
            value={publicationDate}
            onChange={(ev) => setPublicationDate(ev.target.value)}
          />,
        }),
        column({
          header: 'Publisher',
          content: <input
            placeholder="Publisher"
            value={publisher}
            onChange={(ev) => setPublisher(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Rights Status',
          content: <Select
            style={{
              marginBottom: 15,
            }}
            options={[
              { text: 'Copyrighted', key: 'Copyrighted' },
              { text: 'Creative Commons', key: 'Creative Commons' },
              { text: 'Public Domain', key: 'Public Domain' },
            ]}
            selectedOptionKey={rightsStatus}
            setSelectedOptionKey={setRightsStatus}
          />,
        }),
      ],
      [
        column({
          header: 'URL',
          content: <input
            placeholder="URL"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
          />,
        }),
        column({
          header: 'Date Accessed',
          content: <input
            placeholder="Date"
            value={dateAccessed}
            onChange={(ev) => setDateAccessed(ev.target.value)}
          />,
        }),
      ],
    ]),
  },
  Other: {
    text: 'Other',
    additionalMetadataHeight: 490,
    html: rows([
      [
        column({
          header: 'Publication Title',
          content: <input
            placeholder="Publication Title"
            value={publicationTitle}
            onChange={(ev) => setPublicationTitle(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Date',
          content: <input
            placeholder="Date"
            value={publicationDate}
            onChange={(ev) => setPublicationDate(ev.target.value)}
          />,
        }),
        column({
          header: 'Publisher',
          content: <input
            placeholder="Publisher"
            value={publisher}
            onChange={(ev) => setPublisher(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'Publication Location',
          content: <input
            placeholder="Location"
            value={publisherLocation}
            onChange={(ev) => setPublisherLocation(ev.target.value)}
          />,
        }),
        column({
          header: 'Rights Status',
          content: <Select
            options={[
              { text: 'Copyrighted', key: 'Copyrighted' },
              { text: 'Creative Commons', key: 'Creative Commons' },
              { text: 'Public Domain', key: 'Public Domain' },
            ]}
            selectedOptionKey={rightsStatus}
            setSelectedOptionKey={setRightsStatus}
          />,
        }),
      ],
      [
        column({
          header: 'Pages',
          content: <input
            placeholder="Pages (e.g. 1-10)"
            value={pages}
            onChange={(ev) => setPages(ev.target.value)}
          />,
        }),
      ],
      [
        column({
          header: 'URL',
          content: <input
            placeholder="URL"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
          />,
        }),
        column({
          header: 'Date Accessed',
          content: <input
            placeholder="Date"
            value={dateAccessed}
            onChange={(ev) => setDateAccessed(ev.target.value)}
          />,
        }),
      ],
    ]),
  },
});


export default additionalMetadataObj;
