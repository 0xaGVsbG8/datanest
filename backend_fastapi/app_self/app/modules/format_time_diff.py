import time, os


def get(path: str):
    diff = time.time() - os.path.getmtime(path)
    return convert(diff)


def convert(diff: int):
    if diff < 60:
        return f"{int(diff)} sec ago"
    elif diff < 3600:
        return f"{int(diff/60)} min ago"
    elif diff < 86400:
        return f"{int(diff/3600)} h ago"
    elif diff < 2592000:
        return f"{int(diff/86400)} days ago"
    elif diff < 31536000:
        return f"{int(diff/2592000)} months ago"
    else:
        return f"{int(diff/31536000)} years ago"