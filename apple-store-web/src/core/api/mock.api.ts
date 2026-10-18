import type { AxiosAdapter, AxiosResponse } from 'axios';
import { AUTH_ENDPOINTS } from '@features/auth/constants/auth.endpoints';
import { tokenStorage } from '@core/storage/token.storage';
import { USER_ROLES } from '@core/constants/role.constants';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStatusText = (status: number): string => {
  switch (status) {
    case 200: return 'OK';
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 500: return 'Internal Server Error';
    default: return 'Error';
  }
};

const mockSuccessResponse = (data: any, config: any): AxiosResponse => {
  return {
    data: {
      success: true,
      data: data,
    },
    status: 200,
    statusText: 'OK',
    headers: {} as any,
    config: config,
  };
};

const createMockError = (status: number, message: string, config: any): any => {
  const responseData = {
    success: false,
    message: message,
    error: {
      code: status === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST',
      message: message,
    },
  };

  const response: AxiosResponse = {
    data: responseData,
    status: status,
    statusText: getStatusText(status),
    headers: {} as any,
    config: config,
  };

  // Create an Error object mimicking AxiosError properties
  const error: any = new Error(message);
  error.config = config;
  error.response = response;
  error.isAxiosError = true;
  return error;
};

// A module-level global variable simulating the server-side HttpOnly cookie storage
let _mockRefreshToken: string | null = null;
let _mockUser: any = null;

// Helper to create a valid 3-part mock JWT token containing custom claims
const createMockJwt = (payload: any): string => {
  try {
    const header = { alg: "HS256", typ: "JWT" };
    // Safe Base64URL encoding handling Unicode characters
    const safeB64Encode = (obj: any) => {
      const jsonStr = JSON.stringify(obj);
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binStr = "";
      for (let i = 0; i < utf8Bytes.length; i++) {
        binStr += String.fromCharCode(utf8Bytes[i]);
      }
      return btoa(binStr).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    };
    const b64Header = safeB64Encode(header);
    const b64Payload = safeB64Encode(payload);
    const signature = "mock_signature";
    return `${b64Header}.${b64Payload}.${signature}`;
  } catch (error) {
    console.error("Failed to generate mock JWT token:", error);
    return "invalid.mock.token";
  }
};

export const mockAdapter: AxiosAdapter = async (config): Promise<AxiosResponse> => {
  // Simulate network latency
  await delay(800);

  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // Resolve request path (removing the baseURL prefix if it matches)
  let path = url;
  if (config.baseURL && url.startsWith(config.baseURL)) {
    path = url.slice(config.baseURL.length);
  }

  // Normalize path: prefix with slash and strip leading/trailing duplicate slashes
  const cleanPath = '/' + path.replace(/^\/+|\/+$/g, '');

  // Parse payload data
  let data: any = {};
  if (config.data) {
    try {
      data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      data = config.data;
    }
  }

  // Login handler
  if (cleanPath === AUTH_ENDPOINTS.LOGIN && method === 'post') {
    const { identifier, password } = data;

    // Simulate input validation errors
    if (identifier === 'error@kryzo.com') {
      throw createMockError(400, 'Incorrect username or password (Mock Error)', config);
    }

    if (!identifier || (password && password.length < 6)) {
      throw createMockError(400, 'Password must be at least 6 characters.', config);
    }

    const mockUser = {
      id: 'mock_user_admin',
      email: identifier.includes('@') ? identifier : `${identifier}@kryzo.com`,
      fullName: 'Kryzo Admin',
      role: USER_ROLES.ADMIN,
      tenantId: 'mock_tenant_1',
    };

    const tokenPayload = {
      sub: mockUser.id,
      role: mockUser.role,
      tenant_id: mockUser.tenantId,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: "KryzoAgent",
      aud: "KryzoAgentClient",
    };

    const mockSession = {
      accessToken: createMockJwt(tokenPayload),
      expiresInMinutes: 60,
      user: mockUser,
    };

    // Save only user to tokenStorage (Zustand will handle setting token in RAM)
    _mockUser = mockSession.user;

    // Set simulated HttpOnly cookie
    _mockRefreshToken = 'mock_jwt_refresh_token_' + Date.now();

    return mockSuccessResponse(mockSession, config);
  }

  // Register handler
  if (cleanPath === AUTH_ENDPOINTS.REGISTER && method === 'post') {
    const { email, password, fullName, companyName } = data;

    // Simulate input validation errors
    if (email === 'error@kryzo.com') {
      throw createMockError(400, 'Email address is already in use by another tenant.', config);
    }

    if (!email || !fullName || !companyName || (password && password.length < 6)) {
      throw createMockError(400, 'Invalid registration data. Password must be at least 6 characters.', config);
    }

    const mockUser = {
      id: 'mock_user_' + Date.now(),
      email: email,
      fullName: fullName,
      role: USER_ROLES.ADMIN,
      tenantId: 'mock_tenant_' + Date.now(),
    };

    const tokenPayload = {
      sub: mockUser.id,
      role: mockUser.role,
      tenant_id: mockUser.tenantId,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: "KryzoAgent",
      aud: "KryzoAgentClient",
    };

    const mockSession = {
      accessToken: createMockJwt(tokenPayload),
      expiresInMinutes: 60,
      user: mockUser,
    };

    // Save only user to tokenStorage
    _mockUser = mockSession.user;

    // Set simulated HttpOnly cookie
    _mockRefreshToken = 'mock_jwt_refresh_token_' + Date.now();

    return mockSuccessResponse(mockSession, config);
  }

  // Silent refresh handler
  if (cleanPath === AUTH_ENDPOINTS.REFRESH_TOKEN && method === 'post') {
    const user = _mockUser;

    // Check if the simulated HttpOnly cookie exists
    if (_mockRefreshToken && user) {
      const tokenPayload = {
        sub: user.id,
        role: user.role,
        tenant_id: user.tenantId,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: "KryzoAgent",
        aud: "KryzoAgentClient",
      };

      const refreshedSession = {
        accessToken: createMockJwt(tokenPayload),
        expiresInMinutes: 60,
        user: user,
      };

      // Rotate the simulated HttpOnly cookie
      _mockRefreshToken = 'mock_jwt_refresh_token_refreshed_' + Date.now();
      return mockSuccessResponse(refreshedSession, config);
    }

    throw createMockError(401, 'Session expired (Mock Refresh Expiry)', config);
  }

  // Logout handler
  if (cleanPath === AUTH_ENDPOINTS.LOGOUT && method === 'post') {
    _mockRefreshToken = null;
    _mockUser = null;
    tokenStorage.clearAll();
    return mockSuccessResponse({ message: 'Mock logout successful' }, config);
  }

  // Default unhandled endpoints handler
  throw createMockError(404, `Mock API endpoint not found: ${method.toUpperCase()} ${cleanPath}`, config);
};

export const setupMockAdapter = (instance: any) => {
  instance.defaults.adapter = mockAdapter;
};

export default setupMockAdapter;
