#!/bin/bash
for filename in */*.csv; do
	zip files.zip $filename;
done