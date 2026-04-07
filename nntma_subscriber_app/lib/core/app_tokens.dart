import 'package:flutter/material.dart';

class AppTokens {
  static const Color primary = Color(0xFF2A8E9E);
  static const Color primaryDark = Color(0xFF1B5C67);
  static const Color navy = Color(0xFF023347);
  static const Color bg = Color(0xFFF1F8F8);
  static const Color surface = Colors.white;
  static const Color text = Color(0xFF171A1B);
  static const Color textMuted = Color(0xFF798384);
  static const Color textSoft = Color(0xFF929C9D);
  static const Color textFooter = Color(0xFFC8CFD0);
  static const Color border = Color(0xFFE4E7E7);

  static const double radiusMd = 12;
  static const BoxShadow cardShadow = BoxShadow(
    color: Color(0x14000000),
    blurRadius: 24,
    offset: Offset(0, 4),
  );
  static const List<BoxShadow> cardShadows = [
    BoxShadow(color: Color(0x05000000), blurRadius: 4, offset: Offset(0, 1)),
    BoxShadow(color: Color(0x14000000), blurRadius: 20, offset: Offset(0, 6)),
  ];
}

class AppSpace {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
}
