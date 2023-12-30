import { useState, useEffect } from "react";

const KEY = "868d50d8daf2442e9f3d893f55fe3275";

export function useGames(query) {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchGames() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `https://api.rawg.io/api/games?key=${KEY}&search=${query}&platforms=18,1,7`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching Games");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setGames(data.results);
          console.log(data.results);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setGames([]);
        setError("");
        return;
      }

      fetchGames();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { games, isLoading, error };
}
