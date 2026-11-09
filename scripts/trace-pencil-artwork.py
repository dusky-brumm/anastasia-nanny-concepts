"""Prepare small contour paths without changing the original raster artwork.

Input: source asset folder, JSON asset list, output JS, optional JSON overrides.
"""
import hashlib
import json
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def area(points):
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(points, points[1:] + points[:1])) / 2


def simplify(points, epsilon):
    if len(points) < 3:
        return points
    start, end = np.array(points[0], dtype=float), np.array(points[-1], dtype=float)
    delta = end - start
    length = float(np.dot(delta, delta))
    values = np.asarray(points[1:-1], dtype=float)
    if not len(values):
        return [points[0], points[-1]]
    if length:
        positions = np.clip(((values - start) @ delta) / length, 0, 1)
        distances = np.linalg.norm(values - (start + positions[:, None] * delta), axis=1)
    else:
        distances = np.linalg.norm(values - start, axis=1)
    index = int(np.argmax(distances)) + 1
    if distances[index - 1] <= epsilon:
        return [points[0], points[-1]]
    return simplify(points[: index + 1], epsilon)[:-1] + simplify(points[index:], epsilon)


def boundary_loops(mask):
    height, width = mask.shape
    edges = defaultdict(list)
    for y, x in zip(*np.nonzero(mask)):
        x, y = int(x), int(y)
        if y == 0 or not mask[y - 1, x]:
            edges[(x, y)].append((x + 1, y))
        if x == width - 1 or not mask[y, x + 1]:
            edges[(x + 1, y)].append((x + 1, y + 1))
        if y == height - 1 or not mask[y + 1, x]:
            edges[(x + 1, y + 1)].append((x, y + 1))
        if x == 0 or not mask[y, x - 1]:
            edges[(x, y + 1)].append((x, y))
    loops = []
    while edges:
        start = next(iter(edges))
        current, points = start, []
        while current in edges:
            points.append(current)
            choices = edges[current]
            following = choices.pop()
            if not choices:
                del edges[current]
            current = following
            if current == start:
                break
        # Clockwise exteriors have positive area in image coordinates.
        if current == start and len(points) > 5 and area(points) > width * height * .00035:
            loops.append(points)
    return sorted(loops, key=area, reverse=True)[:8]


def contours(filename):
    with Image.open(filename) as image:
        rgba = image.convert('RGBA')
        alpha = rgba.getchannel('A').resize((192, 192), Image.Resampling.LANCZOS)
        alpha = alpha.point(lambda value: 255 if value > 38 else 0)
        alpha = alpha.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
        loops = boundary_loops(np.array(alpha) > 0)
        paths, epsilon = [], .8
        while True:
            paths = []
            for loop in loops:
                pivot = len(loop) // 2
                polygon = simplify(loop[:pivot + 1], epsilon)[:-1] + simplify(loop[pivot:] + loop[:1], epsilon)[:-1]
                if len(polygon) < 3:
                    continue
                xy = [(round(x * 1000 / 192), round(y * 1000 / 192)) for x, y in polygon]
                paths.append('M' + 'L'.join(f'{x} {y}' for x, y in xy) + 'Z')
            if sum(map(len, paths)) < 2800 or epsilon >= 5:
                break
            epsilon += .4
        return {'contours': paths, 'size': list(rgba.size), 'source_sha256': hashlib.sha256(filename.read_bytes()).hexdigest()}


def main():
    source, manifest, output = map(Path, sys.argv[1:4])
    overrides = json.loads(Path(sys.argv[4]).read_text(encoding='utf-8-sig')) if len(sys.argv) > 4 else {}
    names = json.loads(manifest.read_text(encoding='utf-8-sig'))
    data = {}
    for name in sorted(set(names)):
        filename = (source / name).resolve()
        if not filename.is_relative_to(source.resolve()):
            raise ValueError('Asset escapes source folder')
        key = Path(name).name
        data[key] = contours(filename)
        override = overrides.get(key, {})
        if 'max_contours' in override:
            data[key]['contours'] = data[key]['contours'][:override['max_contours']]
        for field in ['contours', 'parts']:
            if field in override:
                data[key][field] = override[field]
    output.write_text('export const pencilArtwork=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print(json.dumps({'assets': len(data), 'bytes': output.stat().st_size}))


if __name__ == '__main__':
    main()
