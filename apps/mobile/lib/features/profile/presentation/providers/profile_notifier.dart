import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../auth/data/auth_repository.dart';

class ProfileState {
  final String? fullName;
  final String? email;
  final String? phone;
  final bool isLoading;
  final bool isPasswordChanging;
  final String? error;
  final bool isPasswordChangedSuccess;

  ProfileState({
    this.fullName,
    this.email,
    this.phone,
    this.isLoading = false,
    this.isPasswordChanging = false,
    this.error,
    this.isPasswordChangedSuccess = false,
  });

  ProfileState copyWith({
    String? fullName,
    String? email,
    String? phone,
    bool? isLoading,
    bool? isPasswordChanging,
    String? error,
    bool? isPasswordChangedSuccess,
  }) {
    return ProfileState(
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      isLoading: isLoading ?? this.isLoading,
      isPasswordChanging: isPasswordChanging ?? this.isPasswordChanging,
      error: error,
      isPasswordChangedSuccess: isPasswordChangedSuccess ?? this.isPasswordChangedSuccess,
    );
  }
}

final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return ProfileNotifier(authRepository);
});

class ProfileNotifier extends StateNotifier<ProfileState> {
  final AuthRepository _repository;

  ProfileNotifier(this._repository) : super(ProfileState()) {
    fetchProfile();
  }

  Future<void> fetchProfile() async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      final data = await _repository.getMe();
      state = state.copyWith(
        fullName: data['full_name'],
        email: data['email'],
        phone: data['phone'],
        isLoading: false,
      );
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data['detail'] ?? 'Erro ao buscar dados de perfil',
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      state = state.copyWith(
        isPasswordChanging: true,
        error: null,
        isPasswordChangedSuccess: false,
      );
      await _repository.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      state = state.copyWith(
        isPasswordChanging: false,
        isPasswordChangedSuccess: true,
      );
    } on DioException catch (e) {
      state = state.copyWith(
        isPasswordChanging: false,
        error: e.response?.data['detail'] ?? 'Erro ao alterar senha',
      );
    } catch (e) {
      state = state.copyWith(
        isPasswordChanging: false,
        error: e.toString(),
      );
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void resetPasswordStatus() {
    state = state.copyWith(isPasswordChangedSuccess: false);
  }
}
