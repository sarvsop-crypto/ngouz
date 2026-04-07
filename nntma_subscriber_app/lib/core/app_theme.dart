import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_tokens.dart';

ThemeData buildAppTheme() {
  final base = ThemeData(useMaterial3: true);
  final txt = GoogleFonts.dmSansTextTheme(base.textTheme);
  final labelBold = GoogleFonts.dmSans(fontWeight: FontWeight.w700, fontSize: 14);
  final labelSemibold = GoogleFonts.dmSans(fontWeight: FontWeight.w600, fontSize: 14);
  const shape10 = RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(10)));

  return base.copyWith(
    scaffoldBackgroundColor: AppTokens.bg,
    colorScheme: ColorScheme.fromSeed(seedColor: AppTokens.primary),
    textTheme: txt.apply(bodyColor: AppTokens.text, displayColor: AppTokens.text),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppTokens.bg,
      foregroundColor: AppTokens.text,
      elevation: 0,
    ),
    dividerTheme: const DividerThemeData(color: AppTokens.border, thickness: 1, space: 1),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      labelStyle: const TextStyle(color: AppTokens.textMuted),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppTokens.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppTokens.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppTokens.primary, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFFDC2626)),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFFDC2626), width: 1.5),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppTokens.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 13),
        shape: shape10,
        textStyle: labelBold,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppTokens.primaryDark,
        side: const BorderSide(color: AppTokens.border),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 13),
        shape: shape10,
        textStyle: labelSemibold,
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppTokens.primaryDark,
        shape: shape10,
        textStyle: labelSemibold,
      ),
    ),
    dataTableTheme: DataTableThemeData(
      headingTextStyle: const TextStyle(
        fontWeight: FontWeight.w700,
        fontSize: 12,
        color: AppTokens.textMuted,
        letterSpacing: 0.3,
      ),
      dataTextStyle: const TextStyle(fontSize: 13.5, color: AppTokens.text),
      headingRowColor: WidgetStateProperty.all<Color>(AppTokens.bg),
    ),
  );
}
