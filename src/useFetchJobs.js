import { useReducer, useEffect } from "react";
import Axios from "axios";

const ACTIONS = {
  MAKE_REQUESTS: "make-requests",
  GET_DATA: "get-data",
  ERROR: "error",
  UPDATE_HAS_NEXT_PAGE: "update-has-next-page",
};

const BASE_URL =
  "https://peaceful-beyond-81725.herokuapp.com/https://jobs.github.com/positions.json";

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.MAKE_REQUESTS:
      return { loading: true, jobs: [] };
    case ACTIONS.GET_DATA:
      return { ...state, loading: false, jobs: action.payload.jobs };
    case ACTIONS.ERROR:
      return { ...state, loading: false, error: true, jobs: [] };
    case ACTIONS.UPDATE_HAS_NEXT_PAGE:
      return { ...state, hasNextPage: action.payload.hasNextPage };
    default:
      return state;
  }
};

export default function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true });

  useEffect(() => {
    const cancelToken = Axios.CancelToken.source();
    dispatch({ type: ACTIONS.MAKE_REQUESTS });
    Axios.get(BASE_URL, {
      cancelToken: cancelToken.token,
      params: { markdown: true, page: page, ...params },
    })
      .then((res) => {
        dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data } });
      })
      .catch((err) => {
        if (Axios.isCancel(err)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: err } });
      });

    const cancelToken1 = Axios.CancelToken.source();

    Axios.get(BASE_URL, {
      cancelToken: cancelToken1.token,
      params: { markdown: true, page: page + 1, ...params },
    })
      .then((res) => {
        dispatch({
          type: ACTIONS.UPDATE_HAS_NEXT_PAGE,
          payload: { hasNextPage: res.data.length !== 0 },
        });
      })
      .catch((err) => {
        if (Axios.isCancel(err)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: err } });
      });
    return () => {
      cancelToken.cancel();
      cancelToken1.cancel();
    };
  }, [params, page]);

  return state;
}
