use tauri::{
  api::process::{Command, CommandEvent}
};
use walkdir::WalkDir;
use chrono::TimeZone;
use std::{path::PathBuf, process::Output};
use std::sync::mpsc;
use image_compressor::{FolderCompressor, Factor};

async fn calculate_time_difference(image_path: &str, given_time: &str)-> Result<String, String> {
let (mut rx, mut child) = Command::new_sidecar("exiftool")
  .expect("failed to create `my-sidecar` binary command")
  .args(["-T","-createdate",image_path])
  .spawn()
  .expect("Failed to spawn sidecar");


let mut output_str = String::new();
while let Some(event) = rx.recv().await {
  if let CommandEvent::Stdout(line) = event {
    output_str.push_str(&line);
  }
}
let mut image_timestamp: i64 = 0;
  let mut given_timestamp: i64 = 0;

  for line in output_str.lines() {
      let image_time_parts: Vec<&str> = line.split_whitespace().collect();
      let image_date_parts: Vec<&str> = image_time_parts[0].split(':').collect();
      let image_hour_parts: Vec<&str> = image_time_parts[1].split(':').collect();

      image_timestamp = chrono::Local.ymd(
          image_date_parts[0].parse().unwrap(),
          image_date_parts[1].parse().unwrap(),
          image_date_parts[2].parse().unwrap(),
      ).and_hms(
          image_hour_parts[0].parse().unwrap(),
          image_hour_parts[1].parse().unwrap(),
          image_hour_parts[0].parse().unwrap(),
      ).timestamp();

      let given_time_parts: Vec<&str> = given_time.split_whitespace().collect();
      let given_date_parts: Vec<&str> = given_time_parts[0].split(':').collect();
      let given_hour_parts: Vec<&str> = given_time_parts[1].split(':').collect();

      given_timestamp = chrono::Local.ymd(
          given_date_parts[0].parse().unwrap(),
          given_date_parts[1].parse().unwrap(),
          given_date_parts[2].parse().unwrap(),
      ).and_hms(
          given_hour_parts[0].parse().unwrap(),
          given_hour_parts[1].parse().unwrap(),
          given_hour_parts[0].parse().unwrap(),
      ).timestamp();
  }

  let diff_timestamp = image_timestamp - given_timestamp;
  let diff_days = diff_timestamp / 86400;
  let diff_time = chrono::Duration::seconds(diff_timestamp);

  let dt = diff_time.to_std().unwrap();
  let seconds = dt.as_secs() % 60;
  let minutes = (dt.as_secs() / 60) % 60;
  let hours = ((dt.as_secs() / 60) / 60) % 24;

  let mut adder = String::from("");
  adder.push_str("0000");
  adder.push_str(":");
  adder.push_str("00");
  adder.push_str(":");
  adder.push_str(&diff_days.to_string());
  adder.push_str(" ");
  adder.push_str(&hours.to_string());
  adder.push_str(":");
  adder.push_str(&minutes.to_string());
  adder.push_str(":");
  adder.push_str(&seconds.to_string());
  println!("output is:{}", adder);
  Ok(adder)
//Ok(output_str)
}

// Finding a raw image in the source directory to get time_diff to be added to all the other images later.
fn find_raw_image(path: &str) -> Option<String> {
  for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
      if let Some(ext) = entry.path().extension() {
          if ext == "NEF" || ext == "CR2" || ext == "ARW" || ext == "RAF" || ext == "RAW" {
              return Some(entry.path().to_string_lossy().into_owned());
          }
      }
  }
  None
}

// Adding the time difference to metadata of the raw files.
async fn add_time_to_createdate(dir_path: &str, time_delta: &str) {
  println!("hi");
  let time_delta = time_delta.to_string();
  //let dir_path = dir_path.to_string();
  let mut adder = String::from("-AllDates+=");
  adder.push_str(&time_delta);
  let (mut rx, mut child) = Command::new_sidecar("exiftool")
  .expect("failed to create `my-sidecar` binary command")
  .args(["-r","-overwrite_original",&adder,dir_path])
  .spawn()
  .expect("Failed to spawn sidecar");

let mut output = String::new();
while let Some(event) = rx.recv().await {
  if let CommandEvent::Stdout(line) = event {
    output.push_str(&line);
  }
}
println!("output is:{}", output);
}

#[tauri::command]
async fn extract_jpg_preview(raw_dir_file_path: &str, output_folder: &str) -> Result<String, String> {
  let mut diir = output_folder.to_owned();
  diir = diir + "%f_%t%-c.%s";
let (mut rx, mut child) = Command::new_sidecar("exiftool")
  .expect("failed to create `my-sidecar` binary command")
  .args(["-a","-b","-W",&diir,"-previewimage",raw_dir_file_path])
  .spawn()
  .expect("Failed to spawn sidecar");

let mut output = String::new();
while let Some(event) = rx.recv().await {
  if let CommandEvent::Stdout(line) = event {
    output.push_str(&line);
  }
}
print!("output is:{}",output);
Ok(output)
}

#[tauri::command]
async fn change_timestamps(raw_dir_file_path: &str,given_time: &str) -> Result<String, String>
{
  let  diffchecker = match find_raw_image(raw_dir_file_path) {
      Some(s) => s,
      None => String::from(""),
  };

  println!("{}\n{}", given_time, diffchecker);
  let adder_result = calculate_time_difference(&diffchecker, given_time).await;
let adder: String = match adder_result {
  Ok(val) => val,
  Err(err) => {
      println!("Error: {}", err);
      String::new()
  }
};
  println!("This is to be added -> {}", adder);
  add_time_to_createdate(raw_dir_file_path, &adder).await;
  let result: Result<String, String> = Ok("Success".to_string());
  result
}

#[tauri::command]
async fn compress_jpeg(raw_dir_file_path: &str, output_folder: &str) -> Result<String, String> {
  let origin = PathBuf::from(raw_dir_file_path); // original directory path
  let dest = PathBuf::from(output_folder); // destination directory path
  let thread_count = 16; // number of threads
  let (tx, _tr) = mpsc::channel(); // Sender and Receiver. for more info, check mpsc and message passing.

  let mut comp = FolderCompressor::new(origin, dest);
  comp.set_cal_func(|_width, _height, _file_size| return Factor::new(70.0, 1.0));
  comp.set_thread_count(thread_count);
  comp.set_sender(tx);

  match comp.compress() {
      Ok(_) => {}
      Err(e) => println!("Cannot compress the folder!: {}", e),
  }
  let result: Result<String, String> = Ok("Success".to_string());
  result
}


#[tauri::command]
async fn extract_and_compress_jpg_preview(raw_dir_file_path: &str, output_folder: &str) -> Result<String, String> {
  // Extract the previews
  let outputfolderstring=output_folder.to_owned();
  let preview_output_folder = format!("{}/previews/", outputfolderstring);
  let finaloutput=format!("{}/output/", outputfolderstring);
    extract_jpg_preview(raw_dir_file_path, &preview_output_folder).await?;
    //extract_jpg_preview(raw_dir_file_path, output_folder).await?;
    compress_jpeg(&preview_output_folder, &finaloutput).await?;

  Ok("Previews extracted and compressed successfully".to_string())
}

fn main() {
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![change_timestamps,compress_jpeg,extract_jpg_preview,extract_and_compress_jpg_preview]) // Add compress_jpeg here
      .run(tauri::generate_context!())
      .expect("failed to run app");
}