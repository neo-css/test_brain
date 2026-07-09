import { useEffect, useState } from 'react';
import {
  loadCollectionVersions,
  loadPatchDetail,
  type CollectionLoadState,
  type DetailLoadState,
} from './versionLoaders';

const initialCollectionState: CollectionLoadState = {
  status: 'loading',
  versions: [],
  error: null,
};

function initialDetailState(patchId: number): DetailLoadState {
  return Number.isFinite(patchId)
    ? { status: 'loading', version: undefined, error: null }
    : { status: 'idle', version: undefined, error: null };
}

export function useCollectionVersions(): CollectionLoadState {
  const [state, setState] = useState<CollectionLoadState>(initialCollectionState);

  useEffect(() => {
    let active = true;
    setState(initialCollectionState);

    loadCollectionVersions().then((nextState) => {
      if (active) setState(nextState);
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

export function usePatchDetail(patchId: number): DetailLoadState {
  const [state, setState] = useState<DetailLoadState>(() => initialDetailState(patchId));

  useEffect(() => {
    let active = true;
    setState(initialDetailState(patchId));

    loadPatchDetail(patchId).then((nextState) => {
      if (active) setState(nextState);
    });

    return () => {
      active = false;
    };
  }, [patchId]);

  return state;
}
