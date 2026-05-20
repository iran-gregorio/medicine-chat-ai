import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/scan/presentation/pages/scan_page.dart';
import '../../features/chat/presentation/pages/chat_page.dart';
import '../../features/chat/presentation/pages/conversation_list_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/reset_password_page.dart';
import '../../features/auth/presentation/providers/auth_notifier.dart';
import '../../features/profile/presentation/pages/profile_page.dart';

final _publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

/// Notifier that bridges Riverpod authProvider → GoRouter refreshListenable.
final _routerNotifierProvider =
    ChangeNotifierProvider<_RouterNotifier>((ref) => _RouterNotifier(ref));

class _RouterNotifier extends ChangeNotifier {
  _RouterNotifier(this._ref) {
    _authState = _ref.read(authProvider);
    _ref.listen<AuthState>(authProvider, (_, next) {
      _authState = next;
      notifyListeners();
    });
  }

  final Ref _ref;
  late AuthState _authState;

  AuthState get authState => _authState;
}

/// Single GoRouter instance, created once by Riverpod.
final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(_routerNotifierProvider);

  return GoRouter(
    initialLocation: '/login',
    refreshListenable: notifier,
    redirect: (context, state) {
      final authState = notifier.authState;
      if (authState.isLoading) return null;

      final isAuthenticated = authState.isAuthenticated;
      final isPublicRoute = _publicRoutes.any(
        (r) => state.matchedLocation.startsWith(r),
      );

      if (!isAuthenticated && !isPublicRoute) return '/login';
      if (isAuthenticated && isPublicRoute) return '/';

      return null;
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) {
          final token = state.uri.queryParameters['token'] ?? '';
          return ResetPasswordPage(token: token);
        },
      ),
      // App routes
      GoRoute(
        path: '/',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/scan',
        builder: (context, state) => const ScanPage(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfilePage(),
      ),
      // Chat: lista de conversas
      GoRoute(
        path: '/conversations',
        builder: (context, state) => const ConversationListPage(),
      ),
      // Chat: conversa específica por ID
      GoRoute(
        path: '/chat/:conversationId',
        builder: (context, state) {
          final conversationId =
              state.pathParameters['conversationId'] ?? '';
          return ChatPage(conversationId: conversationId);
        },
      ),
    ],
  );
});
