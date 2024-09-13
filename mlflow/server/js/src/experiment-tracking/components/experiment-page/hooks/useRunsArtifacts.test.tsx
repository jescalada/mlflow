import { act, renderHook } from '@testing-library/react-hooks';
import { useRunsArtifacts } from './useRunsArtifacts';
import { listArtifactsApi } from '../../../actions'; // Import the actual function
import { MemoryRouter } from '../../../../common/utils/RoutingUtils'; // Simulate router if needed

// Mock the listArtifactsApi function
jest.mock('../../../actions', () => ({
  listArtifactsApi: jest.fn(), // Mock the listArtifactsApi function
}));

describe('useRunsArtifacts', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  const renderParametrizedHook = (runUuids: string[]) => {
    return renderHook(() => useRunsArtifacts(runUuids), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
  };

  test('should return artifacts for each run when API call is successful', async () => {
    const mockArtifacts = [{ id: 'artifact_1' }];
    jest.mocked(listArtifactsApi).mockImplementation((runUuid) => {
      return {
        type: 'LIST_ARTIFACTS',
        payload: Promise.resolve(mockArtifacts),
        meta: { id: 'meta_1', runUuid, path: 'path/to/artifact' },
      };
    });

    const runUuids = ['run_1', 'run_2'];

    const { result, waitForNextUpdate } = renderParametrizedHook(runUuids);

    // Wait for the hook's API call to finish
    await waitForNextUpdate();

    const { artifactsKeyedByRun } = result.current;

    expect(artifactsKeyedByRun).toEqual({
      run_1: mockArtifacts,
      run_2: mockArtifacts,
    });
  });

  test('should handle empty artifacts response', async () => {
    jest.mocked(listArtifactsApi).mockImplementation(() => {
      return {
        type: 'LIST_ARTIFACTS',
        payload: Promise.resolve([]), // Simulating an empty response
        meta: { id: 'meta_1', runUuid: 'run_1', path: 'path/to/artifact' },
      };
    });

    const runUuids = ['run_1'];

    const { result, waitForNextUpdate } = renderParametrizedHook(runUuids);

    await waitForNextUpdate();

    const { artifactsKeyedByRun } = result.current;

    expect(artifactsKeyedByRun).toEqual({
      run_1: [],
    });
  });

  test('should handle errors from the API', async () => {
    const mockError = new Error('Network error');
    jest.mocked(listArtifactsApi).mockImplementation(() => {
      return {
        type: 'LIST_ARTIFACTS',
        payload: Promise.reject(mockError), // Simulating an error
        meta: { id: 'meta_1', runUuid: 'run_1', path: 'path/to/artifact' },
      };
    });

    const runUuids = ['run_1'];

    const { result, waitForNextUpdate } = renderParametrizedHook(runUuids);

    await waitForNextUpdate();

    const { artifactsKeyedByRun, error } = result.current;

    expect(artifactsKeyedByRun).toEqual({});
    expect(error).toEqual(mockError);
  });

  test('should set isLoading to false after fetching is complete', async () => {
    jest.mocked(listArtifactsApi).mockImplementation(() => {
      return {
        type: 'LIST_ARTIFACTS',
        payload: Promise.resolve([{ id: 'artifact_1' }]),
        meta: { id: 'meta_1', runUuid: 'run_1', path: 'path/to/artifact' },
      };
    });

    const runUuids = ['run_1'];

    const { result, waitForNextUpdate } = renderParametrizedHook(runUuids);

    // Check if isLoading is true initially
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    // Check if isLoading is false after update
    expect(result.current.isLoading).toBe(false);
  });
});
