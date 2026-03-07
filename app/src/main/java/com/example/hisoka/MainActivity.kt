package com.example.hisoka

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.hisoka.ui.theme.HisokaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HisokaTheme {
                HisokaScreen()
            }
        }
    }
}

@Composable
fun HisokaScreen() {
    var showDialog by remember { mutableStateOf(false) }
    var peerKey by remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.DarkGray)
    ) {
        Button(
            onClick = { showDialog = true },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(28.dp)
                .size(56.dp),
            shape = CircleShape,
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Blue
            )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .wrapContentSize(Alignment.Center)
            ) {
                Text(
                    text = "+",
                    fontSize = 24.sp,
                    color = Color.White,
                    modifier = Modifier.offset(x = (-2).dp)
                )
            }
        }

        // Модальное окно
        if (showDialog) {
            Dialog(onDismissRequest = { showDialog = false }) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Добавить собеседника",
                            fontSize = 18.sp,
                            color = Color.Black
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        OutlinedTextField(
                            value = peerKey,
                            onValueChange = { peerKey = it },
                            label = { Text("Введите публичный ключ") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            TextButton(
                                onClick = { showDialog = false }
                            ) {
                                Text("Отмена")
                            }

                            Button(
                                onClick = {
                                    if (peerKey.isNotBlank()) {
                                        println("Подключаемся к: $peerKey")
                                        // Здесь будет вызов runClient
                                        showDialog = false
                                        peerKey = ""
                                    }
                                }
                            ) {
                                Text("Добавить")
                            }
                        }
                    }
                }
            }
        }
    }
}