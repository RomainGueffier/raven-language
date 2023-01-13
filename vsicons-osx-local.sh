#!/bin/sh

USER=$( scutil <<< "show State:/Users/ConsoleUser" | awk '/Name :/ && ! /loginwindow/ { print $3 }' )
cp -R vsicons-custom-icons /Users/$USER/Library/Application\ Support/Code/User/