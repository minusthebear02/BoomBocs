var createSongRow = function (songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
        +'  <td class="song-item-number"  data-song-number="' + songNumber + '">' + songNumber + '</td>'
        +'  <td class="song-item-title">' + songName + '</td>'
        +'  <td class="song-item-duration">' + songLength + '</td>'
        +'</tr>';
    
    var $row = $(template);
    
var clickHandler = function() {
    var songNumber = parseInt($(this).attr('data-song-number'));

    if (currentlyPlayingSongNumber !== null) {
		  // Revert to song number for currently playing song because user started playing new song.
        var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		  currentlyPlayingCell.html(currentlyPlayingSongNumber);

    }
    if (currentlyPlayingSongNumber !== songNumber) {
		  // Switch from Play -> Pause button to indicate new song is playing.
        setSong(songNumber);
        $('.volume .fill').css({width: currentVolume + "%"});
        $('.volume .thumb').css({left: currentVolume + "%"});
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
        $(this).html(pauseButtonTemplate);
        currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
        updatePlayerBarSong();
          
    } else if (currentlyPlayingSongNumber === songNumber) {
        
        if (currentSoundFile.isPaused()) {
            $(this).html(pauseButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPauseButton);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
        } else {
            $(this).html(playButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPlayButton);
            currentSoundFile.pause();
        }
           
    }
};
    
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
    };
    
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
        
    };
    
    $row.find('.song-item-number').click(clickHandler);
    
    $row.hover(onHover, offHover);
    
    return $row;
};

var setCurrentAlbum = function(album) {
    
    currentAlbum = album;
    
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    
    $albumSongList.empty();
    
    for (var i = 0; i < album.songs.length; i++){
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var updateSeekBarWhileSongPlays = function() {

    if (currentSoundFile) {
    
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
        
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    var percentageString = offsetXPercent + "%";
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        updateSeekPercentage($(this), seekBarFillRatio);
        
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        };
    });
    
    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();
        
        $(document).bind('mousemove.thumb', function(event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
            
            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            };
            
        });
        
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
}

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    
    $('.main-controls .play-pause').html(playerBarPauseButton);
};

var togglePlayFromPlayerBar = function() {
     if (currentSoundFile.isPaused()) {
         getSongNumberCell(currentlyPlayingSongNumber).html(pauseButtonTemplate);
         $playPauseToggle.html(playerBarPauseButton);
         currentSoundFile.play();
     
     } else if (currentSoundFile) {
         getSongNumberCell(currentlyPlayingSongNumber).html(playButtonTemplate);
         $playPauseToggle.html(playerBarPlayButton);
         currentSoundFile.pause();
     }
 }

var nextSong = function() {
        
        var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
        currentlyPlayingCell.html(currentlyPlayingSongNumber);
        
        var newSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
        newSongIndex++;
    
        if(newSongIndex >= currentAlbum.songs.length) {
            newSongIndex = 0;
        };
        
        currentSongFromAlbum = currentAlbum.songs[newSongIndex];
        currentlyPlayingSongNumber  = newSongIndex + 1;
    
        setSong(currentlyPlayingSongNumber);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
        
        currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
        currentlyPlayingCell.html(pauseButtonTemplate);
        
        updatePlayerBarSong();
};

var previousSong = function() {
    var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    currentlyPlayingCell.html(currentlyPlayingSongNumber);
    
    var newSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    newSongIndex--;
    
    if(newSongIndex < 0) {
        newSongIndex = currentAlbum.songs.length - 1;
    };
    
    currentSongFromAlbum = currentAlbum.songs[newSongIndex];
    currentlyPlayingSongNumber = newSongIndex + 1;
    
    setSong(currentlyPlayingSongNumber);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    
    currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    currentlyPlayingCell.html(pauseButtonTemplate);
    
    updatePlayerBarSong();
}

var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    
    setVolume(currentVolume);
};

var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
}

var setVolume = function(volume) {
    if(currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
}

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';

var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
var $playPauseToggle = $('.main-controls .play-pause');
    
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(window).ready(function() {
    setCurrentAlbum(albumPicasso);
    $nextButton.click(nextSong);
    $previousButton.click(previousSong);
    setupSeekBars();
    $playPauseToggle.click(togglePlayFromPlayerBar);
    
});