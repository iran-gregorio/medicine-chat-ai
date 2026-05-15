import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/auth_repository.dart';
import 'package:dio/dio.dart';

const _storage = FlutterSecureStorage();
const _accessTokenKey = 'access_token';
const _refreshTokenKey = 'refresh_token';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return AuthNotifier(authRepository, ref);
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final Ref _ref;

  AuthNotifier(this._repository, this._ref) : super(AuthState(isLoading: true)) {
    _init();
  }

  Future<void> _init() async {
    final token = await _storage.read(key: _accessTokenKey);
    if (token != null) {
      _setupInterceptors();
      state = state.copyWith(isAuthenticated: true, isLoading: false);
    } else {
      state = state.copyWith(isAuthenticated: false, isLoading: false);
    }
  }

  void _setupInterceptors() {
    final dio = _ref.read(dioProvider);
    dio.interceptors.clear();
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: _accessTokenKey);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            // Try refresh
            final refreshTokenStr = await _storage.read(key: _refreshTokenKey);
            if (refreshTokenStr != null) {
              try {
                final result = await _repository.refreshToken(refreshTokenStr);
                final newAccessToken = result['access_token'];
                final newRefreshToken = result['refresh_token'];
                
                await _storage.write(key: _accessTokenKey, value: newAccessToken);
                await _storage.write(key: _refreshTokenKey, value: newRefreshToken);
                
                // Retry request
                final opts = Options(
                  method: e.requestOptions.method,
                  headers: e.requestOptions.headers,
                );
                opts.headers?['Authorization'] = 'Bearer $newAccessToken';
                
                final cloneReq = await dio.request(
                  e.requestOptions.path,
                  options: opts,
                  data: e.requestOptions.data,
                  queryParameters: e.requestOptions.queryParameters,
                );
                
                return handler.resolve(cloneReq);
              } catch (refreshError) {
                // Refresh failed
                await logout();
              }
            } else {
              await logout();
            }
          }
          return handler.next(e);
        },
      ),
    );
  }

  Future<void> login(String identifier, String password) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      final result = await _repository.login(identifier, password);
      
      await _storage.write(key: _accessTokenKey, value: result['access_token']);
      await _storage.write(key: _refreshTokenKey, value: result['refresh_token']);
      
      _setupInterceptors();
      state = state.copyWith(isAuthenticated: true, isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false, 
        error: e.response?.data['detail'] ?? 'Erro ao fazer login',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _repository.register(
        fullName: fullName,
        email: email,
        password: password,
        phone: phone,
      );
      
      // Attempt login right after
      await login(email, password);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false, 
        error: e.response?.data['detail'] ?? 'Erro ao criar conta',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final refreshTokenStr = await _storage.read(key: _refreshTokenKey);
      if (refreshTokenStr != null) {
        await _repository.logout(refreshTokenStr);
      }
    } catch (e) {
      // Ignora erros no logout (ex: sem internet)
    } finally {
      await _storage.delete(key: _accessTokenKey);
      await _storage.delete(key: _refreshTokenKey);
      _ref.read(dioProvider).interceptors.clear();
      state = state.copyWith(isAuthenticated: false, isLoading: false);
    }
  }

  Future<void> forgotPassword(String email) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _repository.forgotPassword(email);
      state = state.copyWith(isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false, 
        error: e.response?.data['detail'] ?? 'Erro ao enviar e-mail',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> resetPassword(String token, String newPassword) async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      await _repository.resetPassword(token, newPassword);
      state = state.copyWith(isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false, 
        error: e.response?.data['detail'] ?? 'Erro ao redefinir senha',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}
