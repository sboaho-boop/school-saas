@echo off
echo ============================================
echo   EduPlatform APK Builder
echo ============================================
echo.

:: Check for Java
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java not found. Please install Android Studio first.
    echo Download: https://developer.android.com/studio
    echo.
    echo After installing Android Studio:
    echo   1. Open Android Studio
    echo   2. Go to Settings ^> Languages ^> Frameworks ^> Android SDK
    echo   3. Note the SDK path (usually C:\Users\%USERNAME%\AppData\Local\Android\Sdk)
    echo   4. Set ANDROID_HOME environment variable to that path
    echo   5. Add %JAVA_HOME%\bin to your PATH
    pause
    exit /b 1
)

:: Check for Android SDK
if not defined ANDROID_HOME (
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
        echo Auto-detected Android SDK: %ANDROID_HOME%
    ) else (
        echo [ERROR] ANDROID_HOME not set and Android SDK not found.
        echo Please set ANDROID_HOME to your Android SDK path.
        pause
        exit /b 1
    )
)

echo Using Android SDK: %ANDROID_HOME%
echo Using Java: %JAVA_HOME%
echo.

:: Add Android platform if not exists
if not exist "android" (
    echo Adding Android platform...
    npx cap add android
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to add Android platform
        pause
        exit /b 1
    )
)

:: Sync
echo Syncing...
npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to sync
    pause
    exit /b 1
)

:: Build APK
echo Building APK...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================
echo   BUILD SUCCESSFUL!
echo ============================================
echo   APK location:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo ============================================
echo.
pause
