# Android Build Scripts

## build_android.sh

Automated Android APK build script using Docker.

### Usage

```bash
./build_android.sh [project_dir] [build_type] [docker_image]
```

### Parameters

- `project_dir`: Path to Cordova project (default: current directory)
- `build_type`: Build type - `debug`, `release`, or `device` (default: debug)
- `docker_image`: Docker image to use (default: cimg/android:2024.01)

### Examples

```bash
# Build debug APK in current directory
./build_android.sh

# Build release APK
./build_android.sh . release

# Build from specific project
./build_android.sh /path/to/project debug
```

### Output

The script outputs:
- Build progress messages
- APK file location
- APK file size
- Installation command

## Requirements

- Docker
- Internet connection (to pull Docker image)
