import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useKey } from "./useKey";
import { useLocalStorageState } from "./useLocalStorageState";
import { useGames } from "./useGames";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "868d50d8daf2442e9f3d893f55fe3275";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedGame, setSelectedGame] = useState();
  const { games, isLoading, error } = useGames(query);

  const [played, setPlayed] = useLocalStorageState([], "played");
  const [selectedGameId, setSelectedGameId] = useState(null);

  function handleSelectGame(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
    setSelectedGame(games.filter((game) => game.id === id));
  }

  function handleCloseGame() {
    setSelectedId(null);
    setSelectedGameId(null);
  }

  function handleAddPlayed(game) {
    setPlayed((played) => [...played, game]);
  }

  function handleDeletePlayed(id) {
    setPlayed((played) => played.filter((game) => game.id !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults games={games} />
      </NavBar>

      <Main>
        {selectedGameId ? (
          <GameDetails
            selectedId={selectedGameId}
            onCloseGame={handleCloseGame}
            onAddPlayed={handleAddPlayed}
            played={played}
          />
        ) : selectedId ? (
          <GameDetails
            selectedGame={selectedGame}
            selectedId={selectedId}
            onCloseGame={handleCloseGame}
            onAddPlayed={handleAddPlayed}
            played={played}
          />
        ) : query ? (
          <Box>
            {isLoading && <Loader />}
            {!isLoading && !error && (
              <GameList games={games} onSelectGame={handleSelectGame} />
            )}
            {error && <ErrorMessage message={error} />}
          </Box>
        ) : (
          <Box>
            <>
              <PlayedSummary played={played} />
              <PlayedGamesList
                played={played}
                onDeletePlayed={handleDeletePlayed}
                setSelectedGameId={setSelectedGameId}
              />
            </>
          </Box>
        )}
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔️</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <img
        src={process.env.PUBLIC_URL + "/logo.png"}
        alt="logo-ganchor"
        style={{ height: "4rem" }}
      />
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  const handleClear = () => {
    setQuery("");
    inputEl.current.focus();
  };

  return (
    <div className="search-container">
      <input
        className="search"
        type="text"
        placeholder="Search games..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
      {query && (
        <button className="clear-button" onClick={handleClear}>
          x
        </button>
      )}
    </div>
  );
}

function NumResults({ games }) {
  return (
    <p className="num-results">
      Found <strong>{games.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

// Modify GameList component
function GameList({ games, onSelectGame }) {
  return (
    <div className="game-list">
      {games?.map((game) => (
        <GameBox game={game} key={game.id} onSelectGame={onSelectGame} />
      ))}
    </div>
  );
}

// Create a new component GameBox
function GameBox({ game, onSelectGame }) {
  return (
    <div className="game-box" onClick={() => onSelectGame(game.id)}>
      <img src={game.background_image} alt={`${game.name} background_image`} />
      <div className="game-info">
        <h3>{game.name}</h3>
        <p className="game-released">
          <span>🗓</span>
          <span>{game.released}</span>
        </p>
      </div>
    </div>
  );
}

// Modify PlayedGamesList component
function PlayedGamesList({ played, onDeletePlayed, setSelectedGameId }) {
  return (
    <div className="played-games-list">
      {played.map((game) => (
        <PlayedGameBox
          game={game}
          key={game.id}
          onDeletePlayed={onDeletePlayed}
          setSelectedGameId={setSelectedGameId}
        />
      ))}
    </div>
  );
}

// Create a new component PlayedGameBox
function PlayedGameBox({ game, onDeletePlayed, setSelectedGameId }) {
  const handleClick = () => {
    // Call the function to open the game details tab
    setSelectedGameId(game.id);
  };
  return (
    <div className="played-game-box" onClick={handleClick}>
      <img src={game.background_image} alt={`${game.name} background_image`} />
      <div className="game-info">
        <h3>{game.name}</h3>
        <div>
          <p>
            <span>⭐️ User Rating: </span>
            <span>{game.rating}</span>
          </p>
          <p>
            <span>🌟 Your Rating: </span>
            <span>{game.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{game.playtime} hours</span>
          </p>
        </div>
        <button className="btn-delete" onClick={() => onDeletePlayed(game.id)}>
          X
        </button>
      </div>
    </div>
  );
}

function GameDetails({
  selectedGame,
  selectedId,
  onCloseGame,
  onAddPlayed,
  played,
}) {
  const [game, setGame] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  const isPlayed = played.map((game) => game.id).includes(selectedId);
  const playedUserRating = played.find(
    (game) => game.id === selectedId
  )?.userRating;

  const {
    name,
    released,
    background_image,
    playtime,
    rating,
    genres,
    achievements_count,
    description_raw: description,
    metacritic,
    platforms,
    stores,
    developers,
  } = game;

  const screenshots = selectedGame?.at(0)?.short_screenshots;

  function handleAdd() {
    const newPlayedGame = {
      id: selectedId,
      name,
      released,
      background_image,
      rating: Number(rating),
      playtime,
      userRating,
      countRatingDecisions: countRef.current,
    };

    onAddPlayed(newPlayedGame);
  }

  useKey("Escape", onCloseGame);

  useEffect(
    function () {
      async function getGameDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://api.rawg.io/api/games/${selectedId}?key=${KEY}&platforms=18,1,7`
        );
        const data = await res.json();
        setGame(data);
        setIsLoading(false);
      }
      getGameDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!name) return;
      document.name = `Game | ${name}`;

      return function () {
        document.name = "usePopcorn";
      };
    },
    [name]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseGame}>
              &larr;
            </button>
            <img
              src={background_image}
              alt={`background_image of ${game} game`}
            />
            <div className="details-overview">
              <h2>{name}</h2>
              <p>
                {released} &bull; {playtime} hours
              </p>
              <p>
                <span>⭐️</span>
                {rating} esrb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isPlayed ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with game {playedUserRating} <span>⭐️</span>
                </p>
              )}
            </div>
            <div>
              <p>{description}</p>

              <p>MetaCritic Score: {metacritic}</p>
              <p>Number of Achievements: {achievements_count}</p>
              <>
                Platforms:
                <ul>
                  {platforms?.map((item) => {
                    return <li key={item.platform.id}>{item.platform.name}</li>;
                  })}
                </ul>
              </>
              <>
                Genres:
                <ul>
                  {genres?.map((item) => {
                    return <li key={item.id}>{item.name}</li>;
                  })}
                </ul>
              </>
              <>
                Stores:
                <ul>
                  {stores?.map((item) => {
                    return <li key={item.store.id}>{item.store.name}</li>;
                  })}
                </ul>
              </>
              <>
                Developers:
                <ul>
                  {developers?.map((item) => {
                    return <li key={item.id}>{item.name}</li>;
                  })}
                </ul>
              </>
              {selectedGame ? (
                <>
                  Screenshots:
                  <ul>
                    {screenshots?.map((item) => {
                      return (
                        <li key={item.id}>
                          <img src={item.image} alt="screenshot"></img>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <></>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function PlayedSummary({ played }) {
  const avgrating = average(played.map((game) => game.rating));
  const avgUserRating = average(played.map((game) => game.userRating));
  const avgplaytime = average(played.map((game) => game.playtime));

  return (
    <div className="summary">
      <h2>Games you played</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{played.length} games</span>
        </p>
        <p>
          <span>⭐️ User Rating:</span>
          <span>{avgrating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟 Your Rating:</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgplaytime} hours</span>
        </p>
      </div>
    </div>
  );
}
