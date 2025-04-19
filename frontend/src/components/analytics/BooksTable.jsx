function BooksTable({ data }) {
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Книга</th>
              <th>Автор</th>
              <th>Жанр</th>
              <th>Переглядів</th>
              <th>Завантажень</th>
              <th>Рейтинг</th>
            </tr>
          </thead>
          <tbody>
            {data.map((book, index) => (
              <tr key={index}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.genre}</td>
                <td>{book.views.toLocaleString()}</td>
                <td>{book.downloads.toLocaleString()}</td>
                <td>{book.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default BooksTable;